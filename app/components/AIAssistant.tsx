'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import OpenAI from 'openai';

interface AIAssistantProps {
  todos: Array<{
    id: number;
    text: string;
    completed: boolean;
    priority: string;
    category: string;
    createdAt: number;
  }>;
  isDark: boolean;
  onApplyAdvice: (advice: string) => void;
  selectedTaskId: number | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ todos, isDark, onApplyAdvice, selectedTaskId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    overall: string[];
    tasks: Record<number, string[]>;
  }>(() => {
    // 从本地存储加载缓存的分析结果
    const cached = localStorage.getItem('aiAnalysis');
    return cached ? JSON.parse(cached) : { overall: [], tasks: {} };
  });

  // 添加防抖
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

  const [isExpanded, setIsExpanded] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragControls = useDragControls();

  // 缓存检查
  const checkCache = (todo: AIAssistantProps['todos'][0]) => {
    const cachedAnalysis = aiAnalysis.tasks[todo.id];
    if (!cachedAnalysis) return false;

    // 检查缓存是否过期（1小时）
    const lastUpdate = localStorage.getItem(`lastUpdate_${todo.id}`);
    if (!lastUpdate) return false;

    const hoursSinceUpdate = (Date.now() - parseInt(lastUpdate)) / (1000 * 60 * 60);
    return hoursSinceUpdate < 1;
  };

  // 初始化 OpenAI 客户端
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // 生成任务分析提示
  const generatePrompt = (todo: AIAssistantProps['todos'][0], allTodos: AIAssistantProps['todos']) => {
    const taskContext = {
      currentTask: {
        text: todo.text,
        priority: todo.priority,
        category: todo.category,
        completed: todo.completed,
        daysSinceCreation: Math.floor((Date.now() - todo.createdAt) / (1000 * 60 * 60 * 24))
      },
      relatedTasks: allTodos.filter(t => 
        t.id !== todo.id && 
        (t.category === todo.category || 
         t.text.toLowerCase().includes(todo.text.toLowerCase()) ||
         todo.text.toLowerCase().includes(t.text.toLowerCase()))
      ).map(t => ({
        text: t.text,
        completed: t.completed,
        priority: t.priority
      })),
      categoryStats: {
        total: allTodos.filter(t => t.category === todo.category).length,
        completed: allTodos.filter(t => t.category === todo.category && t.completed).length
      }
    };

    return `作为一个专业的任务管理 AI 助手，请分析以下任务并提供专业的建议：

任务信息：
${JSON.stringify(taskContext, null, 2)}

请从以下几个方面进行分析：
1. 任务紧急性和重要性
2. 任务间的关联性和影响
3. 时间管理建议
4. 执行策略建议
5. 潜在风险提示

请用中文回答，每个方面的分析要简洁专业，突出重点。不需要重复已知信息，直接给出分析结果和建议。`;
  };

  // 生成整体分析提示
  const generateOverallPrompt = (allTodos: AIAssistantProps['todos']) => {
    const stats = {
      total: allTodos.length,
      completed: allTodos.filter(t => t.completed).length,
      byCategory: Object.entries(
        allTodos.reduce((acc, todo) => {
          acc[todo.category] = (acc[todo.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ),
      byPriority: Object.entries(
        allTodos.reduce((acc, todo) => {
          acc[todo.priority] = (acc[todo.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
    };

    return `作为一个专业的任务管理 AI 助手，请分析以下任务统计数据并提供整体建议：

任务统计：
${JSON.stringify(stats, null, 2)}

请从以下几个方面进行分析：
1. 整体任务完成情况
2. 任务分布特点
3. 工作负载评估
4. 效率提升建议
5. 任务管理优化建议

请用中文回答，分析要简洁专业，突出重点。不需要重复已知信息，直接给出分析结果和建议。`;
  };

  // 调用 ChatGPT API 获取分析结果
  const getAIAnalysis = async (prompt: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API 密钥未配置，请检查环境变量设置');
      }

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 500
      });

      if (!completion.choices[0]?.message?.content) {
        throw new Error('API 返回结果异常');
      }

      return completion.choices[0].message.content.split('\n').filter(line => line.trim());
    } catch (err) {
      console.error('ChatGPT API 调用失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(`AI 分析生成失败: ${errorMessage}`);
      return [];
    }
  };

  // 更新分析结果
  useEffect(() => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    const updateAnalysis = async () => {
      if (!selectedTaskId && todos.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let newAnalysis = { ...aiAnalysis };

        // 只在没有选中特定任务时才进行整体分析
        if (!selectedTaskId) {
          const overallAnalysis = await getAIAnalysis(generateOverallPrompt(todos));
          newAnalysis.overall = overallAnalysis;
        }
        
        // 如果选中了特定任务，只分析该任务
        if (selectedTaskId) {
          const selectedTodo = todos.find(t => t.id === selectedTaskId);
          if (selectedTodo) {
            const analysis = await getAIAnalysis(generatePrompt(selectedTodo, todos));
            newAnalysis.tasks = {
              ...newAnalysis.tasks,
              [selectedTaskId]: analysis
            };
            localStorage.setItem(`lastUpdate_${selectedTaskId}`, Date.now().toString());
          }
        }

        setAiAnalysis(newAnalysis);
        localStorage.setItem('aiAnalysis', JSON.stringify(newAnalysis));
      } catch (err) {
        if (err instanceof Error && err.message.includes('429')) {
          setError('API 调用频率超限，请稍后再试');
        } else {
          setError(err instanceof Error ? err.message : '分析生成失败');
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(updateAnalysis, 1000);
    setUpdateTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [selectedTaskId]);

  // 清除缓存的函数
  const clearCache = () => {
    localStorage.removeItem('aiAnalysis');
    todos.forEach(todo => {
      localStorage.removeItem(`lastUpdate_${todo.id}`);
    });
    setAiAnalysis({ overall: [], tasks: {} });
  };

  return (
    <AnimatePresence>
      {isExpanded ? (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className={`fixed right-0 top-0 h-screen w-80 overflow-y-auto ${
            isDark 
              ? 'bg-gray-800/95 text-white border-l border-gray-700' 
              : 'bg-white/95 text-gray-800 border-l border-gray-200'
          } shadow-xl backdrop-blur-lg p-6`}
        >
          <div className="sticky top-0 z-10 pb-4 mb-4 border-b border-gray-200/20 bg-inherit">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold flex items-center ${
                isDark ? 'text-blue-300' : 'text-blue-600'
              }`}>
                <span className="text-2xl mr-2">🤖</span>
                AI 助手
                {loading && (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="ml-2 inline-block"
                  >
                    ⚙️
                  </motion.span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCache}
                  className={`text-sm px-3 py-1 rounded-full transition-all ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  🔄 刷新
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className={`text-sm px-2 py-1 rounded-full transition-all ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title="收起"
                >
                  ⬅️
                </button>
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-4 ${
                isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-600'
              }`}
            >
              <div className="flex items-start">
                <span className="mr-2">⚠️</span>
                <div>
                  {error}
                  {error.includes('429') && (
                    <div className="mt-2 text-sm opacity-80">
                      建议：
                      <ul className="list-disc list-inside mt-1">
                        <li>减少任务更新频率</li>
                        <li>检查 OpenAI API 账户额度</li>
                        <li>稍后再试</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 整体分析 */}
          {!selectedTaskId && (
            <div className="space-y-3 mb-6">
              <h3 className={`text-sm font-medium mb-3 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                �� 整体分析
              </h3>
              <AnimatePresence>
                {aiAnalysis.overall.map((item, index) => (
                  <motion.div
                    key={`general-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className={`p-3 rounded-lg text-sm ${
                      isDark 
                        ? 'bg-gray-700/50 hover:bg-gray-700/70' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    } transition-all cursor-default`}
                    >
                      {item}
                    </div>
                    <button
                      onClick={() => onApplyAdvice(item)}
                      className={`absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                        isDark
                          ? 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                      }`}
                      title="应用这条建议"
                    >
                      📌
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* 单个任务分析 */}
          {selectedTaskId && todos.length > 0 && (
            <div>
              <h3 className={`text-sm font-medium mb-3 flex items-center justify-between ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                🔍 任务分析
              </h3>
              <div className="space-y-3">
                {todos
                  .filter(todo => todo.id === selectedTaskId)
                  .map((todo) => {
                    const taskAdvice = aiAnalysis.tasks[todo.id] || [];
                    if (taskAdvice.length === 0) return null;
                    
                    return (
                      <motion.div
                        key={`task-${todo.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg text-sm ${
                          isDark 
                            ? 'bg-gray-700/50' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className={`font-medium mb-2 ${
                          isDark ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          {todo.text}
                        </div>
                        <div className="space-y-2">
                          {taskAdvice.map((advice, index) => (
                            <div 
                              key={index}
                              className="relative group"
                            >
                              <div className={`p-2 rounded ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {advice}
                              </div>
                              <button
                                onClick={() => onApplyAdvice(advice)}
                                className={`absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                  isDark
                                    ? 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300'
                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                }`}
                                title="应用这条建议"
                              >
                                📌
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          )}

          {todos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-3">📝</div>
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                还没有任务，开始添加一些任务来获取建议吧！
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          drag
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0.1}
          whileDrag={{ scale: 1.1 }}
          animate={{ x: position.x, y: position.y }}
          onDragEnd={(event, info) => {
            setPosition({
              x: position.x + info.offset.x,
              y: position.y + info.offset.y
            });
          }}
          className={`fixed right-6 bottom-6 p-4 rounded-full shadow-lg cursor-move ${
            isDark 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white text-gray-800 hover:bg-gray-100'
          } transition-colors`}
          onClick={() => setIsExpanded(true)}
        >
          <div className="relative">
            <span className="text-2xl">🤖</span>
            {loading && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            {(selectedTaskId || aiAnalysis.overall.length > 0) && (
              <motion.div
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  isDark ? 'bg-blue-400' : 'bg-blue-500'
                }`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant; 