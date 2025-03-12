'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Statistics from './Statistics';
import AIAssistant from './AIAssistant';
import Layout from './Layout';
import Login, { UserInfo } from './Login';

// 添加预设分类
const PRESET_CATEGORIES = ['个人', '工作', '学习', '生活', '其他'];

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: number;
}

interface TodoProps {
  isDark: boolean;
}

const Todo: React.FC<TodoProps> = ({ isDark }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('个人');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [appliedAdvices, setAppliedAdvices] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  // 从 localStorage 加载用户数据和待办事项
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('todolist_user_info');
    if (savedUserInfo) {
      setIsLoggedIn(true);
      setUserInfo(JSON.parse(savedUserInfo));
    }

    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // 保存数据到 localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputText.trim() !== '') {
      const newTodo: TodoItem = {
        id: Date.now(),
        text: inputText,
        completed: false,
        priority,
        category,
        createdAt: Date.now(),
      };
      setTodos([...todos, newTodo]);
      setInputText('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEditing = (id: number) => {
    setEditingId(id);
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      setInputText(todo.text);
    }
  };

  const saveEdit = () => {
    if (editingId && inputText.trim() !== '') {
      setTodos(
        todos.map((todo) =>
          todo.id === editingId ? { ...todo, text: inputText } : todo
        )
      );
      setEditingId(null);
      setInputText('');
    }
  };

  const getPriorityColor = (priority: string) => {
    if (isDark) {
      switch (priority) {
        case 'high':
          return 'bg-red-900/30 border-red-700/50 text-red-200';
        case 'medium':
          return 'bg-yellow-900/30 border-yellow-700/50 text-yellow-200';
        case 'low':
          return 'bg-green-900/30 border-green-700/50 text-green-200';
        default:
          return 'bg-gray-800 border-gray-700 text-gray-200';
      }
    }
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  // 日期过滤函数
  const isDateInRange = (date: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todoDate = new Date(date);
    todoDate.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case 'today':
        return todoDate.getTime() === today.getTime();
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return todoDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return todoDate >= monthAgo;
      }
      case 'custom': {
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return todoDate >= start && todoDate <= end;
      }
      default:
        return true;
    }
  };

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .filter((todo) => {
      if (categoryFilter === 'all') return true;
      return todo.category === categoryFilter;
    })
    .filter((todo) => isDateInRange(todo.createdAt));

  const usedCategories = Array.from(new Set(todos.map(todo => todo.category)));
  const allCategories = Array.from(new Set([...PRESET_CATEGORIES, ...usedCategories]));

  // 添加统计数据计算
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    categories: todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number })
  };

  // 添加动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // 添加处理自定义分类的函数
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsAddingCategory(true);
    } else {
      setCategory(value);
      setIsAddingCategory(false);
    }
  };

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      setCategory(customCategory.trim());
      setCustomCategory('');
      setIsAddingCategory(false);
    }
  };

  const handleCancelCustomCategory = () => {
    setIsAddingCategory(false);
    setCustomCategory('');
  };

  const handleLogin = (userInfo: UserInfo) => {
    setIsLoggedIn(true);
    setUserInfo(userInfo);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    localStorage.removeItem('todolist_user_info');
    // 可选：是否要清除待办事项
    // setTodos([]);
    // localStorage.removeItem('todos');
  };

  if (!isLoggedIn || !userInfo) {
    return <Login isDark={isDark} onLogin={handleLogin} />;
  }

  return (
    <Layout 
      isDark={isDark} 
      appliedAdvices={appliedAdvices}
      onRemoveAdvice={(index) => setAppliedAdvices(prev => prev.filter((_, i) => i !== index))}
      stats={stats}
    >
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* 用户信息区域 */}
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={userInfo.avatar}
                alt={userInfo.nickname}
                className="w-12 h-12 rounded-full border-2 border-blue-500/30"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{userInfo.nickname}</span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                }`}>
                  活跃
                </span>
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {userInfo.email || '未设置邮箱'}
              </span>
            </div>
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`p-2 rounded-lg transition-all ${
                isDark
                  ? 'hover:bg-gray-700/50'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">⚙️</span>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-50 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } border ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className={`w-full px-4 py-2 text-left rounded-lg transition-all ${
                        isDark
                          ? 'text-red-300 hover:bg-red-900/30'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      退出登录
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 输入区域 */}
        <div className={`${
          isDark ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50' : 'bg-gradient-to-br from-white/80 to-gray-50/80'
        } backdrop-blur-xl border-t border-l ${
          isDark ? 'border-white/5' : 'border-white/20'
        } shadow-2xl rounded-3xl overflow-hidden`}>
          {/* 标题 */}
          <div className={`px-6 md:px-8 pt-6 md:pt-8 pb-4`}>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-3 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              <span className="text-2xl sm:text-3xl md:text-4xl">📝</span>
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                TODOLIST
              </span>
            </motion.h1>
          </div>

          {/* 主输入框 */}
          <div className="px-6 md:px-8 pb-6 md:pb-8">
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="✨ 写下你想完成的事情..."
                className={`w-full text-base sm:text-lg md:text-xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 rounded-2xl transition-all ${
                  isDark 
                    ? 'bg-gray-800/30 text-white placeholder-gray-400 focus:bg-gray-800/50'
                    : 'bg-white/50 text-gray-800 placeholder-gray-400 focus:bg-white/80'
                } border ${
                  isDark ? 'border-gray-700/50' : 'border-gray-200/50'
                } focus:border-blue-500/30 outline-none shadow-inner`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowOptions(!showOptions)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                  isDark
                    ? 'hover:bg-gray-700/50 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {showOptions ? '⬆️' : '⬇️'}
              </motion.button>
            </div>
          </div>

          {/* 选项区域 */}
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`px-6 md:px-8 pb-6 md:pb-8 space-y-4`}
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* 优先级选择 */}
                  <div className={`flex items-center gap-3 px-4 md:px-5 py-2 md:py-3 rounded-xl ${
                    isDark ? 'bg-gray-800/30' : 'bg-white/50'
                  } border ${isDark ? 'border-gray-700/30' : 'border-gray-200/30'}`}>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      优先级
                    </span>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setPriority(p as 'low' | 'medium' | 'high')}
                          className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-sm transition-all ${
                            priority === p
                              ? isDark
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-blue-100 text-blue-600 border-blue-200'
                              : isDark
                                ? 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          } border`}
                        >
                          {{
                            low: '🟢 低',
                            medium: '🟡 中',
                            high: '🔴 高'
                          }[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 分类选择 */}
                  <div className={`flex items-center gap-3 px-4 md:px-5 py-2 md:py-3 rounded-xl ${
                    isDark ? 'bg-gray-800/30' : 'bg-white/50'
                  } border ${isDark ? 'border-gray-700/30' : 'border-gray-200/30'}`}>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      分类
                    </span>
                    {isAddingCategory ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="新分类名称..."
                          className={`px-4 py-1.5 rounded-lg text-sm ${
                            isDark
                              ? 'bg-gray-700/50 text-gray-200 border-gray-600/50'
                              : 'bg-white text-gray-700 border-gray-200/50'
                          } border outline-none focus:border-blue-500/50`}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCustomCategorySubmit}
                          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                            isDark
                              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          确认
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCancelCustomCategory}
                          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                            isDark
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          取消
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {allCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg text-sm transition-all ${
                              category === cat
                                ? isDark
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                  : 'bg-blue-100 text-blue-600 border-blue-200'
                                : isDark
                                  ? 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            } border`}
                          >
                            📁 {cat}
                          </button>
                        ))}
                        <button
                          onClick={() => setIsAddingCategory(true)}
                          className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg text-sm transition-all ${
                            isDark
                              ? 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          } border`}
                        >
                          ➕ 新分类
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={editingId ? saveEdit : addTodo}
                  disabled={!inputText.trim()}
                  className={`w-full md:w-auto px-6 md:px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    !inputText.trim() 
                      ? isDark 
                        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isDark 
                        ? 'bg-gradient-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-400/80 hover:to-blue-500/80 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white'
                  } shadow-lg`}
                >
                  <span className="text-xl">{editingId ? '💾' : '✨'}</span>
                  <span className="font-medium">{editingId ? '保存更改' : '添加任务'}</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 任务列表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* 未完成任务 */}
          <div className={`relative p-4 md:p-8 rounded-2xl shadow-lg ${
            isDark ? 'bg-gray-800/50' : 'bg-white/80'
          } backdrop-blur-xl border ${
            isDark ? 'border-white/5' : 'border-gray-200/20'
          } transition-all hover:shadow-xl`}>
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <span className="text-xl sm:text-2xl md:text-3xl">📝</span>
              <span>待完成任务</span>
              <span className={`ml-2 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
              }`}>
                {filteredTodos.filter(todo => !todo.completed).length}
              </span>
            </h2>
            <div className="space-y-4">
              {filteredTodos.filter(todo => !todo.completed).map((todo, index) => (
                <motion.li
                  key={todo.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.02, translateX: 5 }}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-all ${getPriorityColor(todo.priority)} hover:shadow-md`}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-6 h-6 mr-4 rounded border-2 cursor-pointer transition-all"
                    />
                    <div className="flex flex-col">
                      <span
                        className={`text-base sm:text-lg transition-all ${
                          todo.completed 
                            ? 'line-through text-gray-500' 
                            : isDark ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {todo.text}
                      </span>
                      <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {todo.category} · {new Date(todo.createdAt).toLocaleDateString()} {new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => startEditing(todo.id)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        isDark
                          ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      ✏️ 编辑
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteTodo(todo.id)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        isDark
                          ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      🗑️ 删除
                    </motion.button>
                    <button
                      onClick={() => setSelectedTaskId(todo.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isDark
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title="分析此任务"
                    >
                      🔍
                    </button>
                  </div>
                </motion.li>
              ))}
              {filteredTodos.filter(todo => !todo.completed).length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-12 rounded-xl border-2 border-dashed ${
                    isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  <span className="text-4xl mb-4 block">🎉</span>
                  <p>太棒了！暂无待完成任务</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* 已完成任务 */}
          <div className={`relative p-4 md:p-8 rounded-2xl shadow-lg ${
            isDark ? 'bg-gray-800/50' : 'bg-white/80'
          } backdrop-blur-xl border ${
            isDark ? 'border-white/5' : 'border-gray-200/20'
          } transition-all hover:shadow-xl`}>
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <span className="text-xl sm:text-2xl md:text-3xl">✅</span>
              <span>已完成任务</span>
              <span className={`ml-2 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-600'
              }`}>
                {filteredTodos.filter(todo => todo.completed).length}
              </span>
            </h2>
            <div className="space-y-4">
              {filteredTodos.filter(todo => todo.completed).map((todo, index) => (
                <motion.li
                  key={todo.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.02, translateX: 5 }}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-all ${getPriorityColor(todo.priority)} hover:shadow-md`}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-6 h-6 mr-4 rounded border-2 cursor-pointer transition-all"
                    />
                    <div className="flex flex-col">
                      <span
                        className={`text-base sm:text-lg transition-all ${
                          todo.completed 
                            ? 'line-through text-gray-500' 
                            : isDark ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {todo.text}
                      </span>
                      <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {todo.category} · {new Date(todo.createdAt).toLocaleDateString()} {new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => startEditing(todo.id)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        isDark
                          ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      ✏️ 编辑
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteTodo(todo.id)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        isDark
                          ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      🗑️ 删除
                    </motion.button>
                    <button
                      onClick={() => setSelectedTaskId(todo.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isDark
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title="分析此任务"
                    >
                      🔍
                    </button>
                  </div>
                </motion.li>
              ))}
              {filteredTodos.filter(todo => todo.completed).length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-12 rounded-xl border-2 border-dashed ${
                    isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  <span className="text-4xl mb-4 block">💪</span>
                  <p>开始完成一些任务吧！</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* AI助手区域 */}
        <div className={`relative p-6 rounded-xl shadow-lg ${
          isDark ? 'bg-gray-800/50' : 'bg-white/80'
        } backdrop-blur-sm`}>
          <h2 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <span>🤖 AI 助手</span>
            <span className={`text-xs sm:text-sm px-2 py-0.5 sm:py-1 rounded-full ${
              isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
            }`}>Beta</span>
          </h2>
          <AIAssistant
            todos={todos}
            isDark={isDark}
            selectedTaskId={selectedTaskId}
            onApplyAdvice={(advice: string) => {
              try {
                if (advice && typeof advice === 'string') {
                  const newAdvices = [...appliedAdvices];
                  newAdvices.push(advice);
                  setAppliedAdvices(newAdvices);
                  setSelectedTaskId(null);
                }
              } catch (error) {
                console.error('添加建议时出错:', error);
              }
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Todo; 