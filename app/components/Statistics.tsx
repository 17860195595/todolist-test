'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatisticsProps {
  isDark: boolean;
  stats: {
    total: number;
    completed: number;
    categories: { [key: string]: number };
  };
}

const Statistics: React.FC<StatisticsProps> = ({ isDark, stats }) => {
  // 计算完成率
  const completionRate = stats.total > 0 
    ? ((stats.completed / stats.total) * 100).toFixed(1) 
    : '0';

  // 计算各分类的完成情况
  const categoryStats = Object.entries(stats.categories).map(([category, count]) => ({
    category,
    count,
    percentage: ((count / stats.total) * 100).toFixed(1)
  }));

  return (
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
        📊 任务统计
      </h1>

      {/* 总体统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}
        >
          <div className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-blue-300' : 'text-blue-600'
          }`}>
            {stats.total}
          </div>
          <div className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            总任务数
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}
        >
          <div className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-green-300' : 'text-green-600'
          }`}>
            {stats.completed}
          </div>
          <div className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            已完成任务
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl ${
            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}
        >
          <div className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-purple-300' : 'text-purple-600'
          }`}>
            {completionRate}%
          </div>
          <div className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            任务完成率
          </div>
        </motion.div>
      </div>

      {/* 分类统计 */}
      <div>
        <h2 className={`text-xl font-bold mb-6 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          📁 分类统计
        </h2>
        <div className="space-y-4">
          {categoryStats.map(({ category, count, percentage }) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {category}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  isDark 
                    ? 'bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {count} 个任务
                </span>
              </div>
              <div className="relative pt-1">
                <div className={`overflow-hidden h-2 text-xs flex rounded ${
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      isDark ? 'bg-blue-500' : 'bg-blue-600'
                    }`}
                  />
                </div>
                <span className={`text-xs mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  占比 {percentage}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Statistics; 