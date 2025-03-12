'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Statistics from './Statistics';

interface LayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  appliedAdvices: string[];
  onRemoveAdvice: (index: number) => void;
  stats: {
    total: number;
    completed: number;
    categories: { [key: string]: number };
  };
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isDark, 
  appliedAdvices, 
  onRemoveAdvice,
  stats 
}) => {
  const [currentPage, setCurrentPage] = useState<'todolist' | 'advice' | 'statistics'>('todolist');

  return (
    <div className="flex h-screen">
      {/* 左侧导航栏 */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`w-64 h-screen fixed left-0 top-0 ${
          isDark 
            ? 'bg-gray-800/95 border-r border-gray-700' 
            : 'bg-white/95 border-r border-gray-200'
        } backdrop-blur-lg p-6`}
      >
        <h2 className={`text-2xl font-bold mb-8 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          ✨ Todo App
        </h2>
        
        <nav className="space-y-2">
          <button
            onClick={() => setCurrentPage('todolist')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              currentPage === 'todolist'
                ? isDark
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'bg-blue-100 text-blue-600'
                : isDark
                  ? 'text-gray-300 hover:bg-gray-700/50'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📝 待办事项
          </button>
          <button
            onClick={() => setCurrentPage('statistics')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              currentPage === 'statistics'
                ? isDark
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'bg-blue-100 text-blue-600'
                : isDark
                  ? 'text-gray-300 hover:bg-gray-700/50'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 统计
          </button>
          <button
            onClick={() => setCurrentPage('advice')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              currentPage === 'advice'
                ? isDark
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'bg-blue-100 text-blue-600'
                : isDark
                  ? 'text-gray-300 hover:bg-gray-700/50'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💡 应用建议
            {appliedAdvices.length > 0 && (
              <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-600'
              }`}>
                {appliedAdvices.length}
              </span>
            )}
          </button>
        </nav>
      </motion.div>

      {/* 主要内容区域 */}
      <div className="flex-1 ml-64">
        {currentPage === 'todolist' ? (
          children
        ) : currentPage === 'statistics' ? (
          <Statistics isDark={isDark} stats={stats} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-4xl mx-auto mt-10 p-8 rounded-xl shadow-2xl ${
              isDark ? 'bg-gray-800/50' : 'bg-white/80'
            } backdrop-blur-sm`}
          >
            <h1 className={`text-3xl font-bold mb-8 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              💡 应用建议
            </h1>
            
            {appliedAdvices.length === 0 ? (
              <div className={`text-center py-12 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="text-4xl mb-4">💭</div>
                <p>还没有应用任何建议</p>
                <p className="text-sm mt-2">从 AI 助手的建议中选择并应用一些建议吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedAdvices.map((advice, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 rounded-lg relative group ${
                      isDark
                        ? 'bg-gray-700/50 hover:bg-gray-700/70'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`text-lg ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {advice}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        应用时间: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => onRemoveAdvice(index)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-lg ${
                          isDark
                            ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        删除
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Layout; 