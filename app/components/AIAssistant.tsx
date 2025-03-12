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
  const [analysis, setAnalysis] = useState<string>('');
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

  // 检查是否配置了 API Key
  const isConfigured = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;

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
    if (!isConfigured) {
      setError('AI 助手功能暂未开启，请配置 OpenAI API Key');
      return;
    }

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
  }, [selectedTaskId, todos]);

  // 清除缓存的函数
  const clearCache = () => {
    localStorage.removeItem('aiAnalysis');
    todos.forEach(todo => {
      localStorage.removeItem(`lastUpdate_${todo.id}`);
    });
    setAiAnalysis({ overall: [], tasks: {} });
  };

  if (!isConfigured) {
    return (
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-yellow-900/20 text-yellow-200' : 'bg-yellow-50 text-yellow-800'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-lg font-medium">AI 助手未配置</h3>
        </div>
        <p className="text-sm opacity-80">
          请在环境变量中配置 NEXT_PUBLIC_OPENAI_API_KEY 以启用 AI 助手功能。
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-800'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">❌</span>
          <h3 className="text-lg font-medium">出错了</h3>
        </div>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isExpanded ? (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className={`fixed right-0 bottom-0 md:top-0 h-[70vh] md:h-screen w-full md:w-96 lg:w-[420px] overflow-y-auto ${
            isDark 
              ? 'bg-gray-800/95 text-white border-t md:border-l border-gray-700' 
              : 'bg-white/95 text-gray-800 border-t md:border-l border-gray-200'
          } shadow-xl backdrop-blur-lg`}
        >
          {/* 头部区域 */}
          <div className={`sticky top-0 z-10 p-4 md:p-6 border-b ${
            isDark ? 'border-gray-700/50 bg-gray-800/95' : 'border-gray-200/50 bg-white/95'
          } backdrop-blur-xl`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-lg md:text-xl font-bold flex items-center ${
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearCache}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                    isDark 
                      ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  🔄 刷新
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsExpanded(false)}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                    isDark 
                      ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title="收起"
                >
                  收起 ⬅️
                </motion.button>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-4 md:p-6 space-y-6">
            {/* 整体分析 */}
            {!selectedTaskId && (
              <div className="space-y-4">
                <h3 className={`text-sm font-medium flex items-center gap-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>📊</span>
                  整体分析
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
                      <div className={`p-4 rounded-xl text-sm ${
                        isDark 
                          ? 'bg-gray-700/50 hover:bg-gray-700/70' 
                          : 'bg-gray-50 hover:bg-gray-100'
                        } transition-all cursor-default`}
                      >
                        {item}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onApplyAdvice(item)}
                          className={`absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg ${
                            isDark
                              ? 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                          }`}
                          title="应用这条建议"
                        >
                          📌 应用
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* 单个任务分析 */}
            {selectedTaskId && todos.length > 0 && (
              <div className="space-y-4">
                <h3 className={`text-sm font-medium flex items-center gap-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>🔍</span>
                  任务分析
                </h3>
                <div className="space-y-4">
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
                          className={`rounded-xl overflow-hidden ${
                            isDark 
                              ? 'bg-gray-700/30' 
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className={`p-4 ${
                            isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'
                          }`}>
                            <div className={`font-medium ${
                              isDark ? 'text-blue-300' : 'text-blue-600'
                            }`}>
                              {todo.text}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {taskAdvice.map((advice, index) => (
                              <div 
                                key={index}
                                className="relative group"
                              >
                                <div className={`p-3 rounded-lg ${
                                  isDark 
                                    ? 'bg-gray-800/30 text-gray-300' 
                                    : 'bg-white text-gray-600'
                                }`}>
                                  {advice}
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onApplyAdvice(advice)}
                                    className={`absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg ${
                                      isDark
                                        ? 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300'
                                        : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                    }`}
                                    title="应用这条建议"
                                  >
                                    📌 应用
                                  </motion.button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 空状态 */}
            {todos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center py-12 rounded-xl border-2 border-dashed ${
                  isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                }`}
              >
                <div className="text-4xl mb-4">📝</div>
                <div className="text-sm">
                  还没有任务，开始添加一些任务来获取建议吧！
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          drag
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0.1}
          whileHover={{ scale: 1.05 }}
          whileDrag={{ scale: 1.1 }}
          animate={{ x: position.x, y: position.y }}
          onDragEnd={(event, info) => {
            setPosition({
              x: position.x + info.offset.x,
              y: position.y + info.offset.y
            });
          }}
          className={`fixed right-4 bottom-20 p-4 rounded-full shadow-lg cursor-move z-50 ${
            isDark 
              ? 'bg-gray-800/95 text-white hover:bg-gray-700/95' 
              : 'bg-white/95 text-gray-800 hover:bg-gray-100/95'
          } backdrop-blur-sm transition-colors`}
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