'use client';

import { useState, useEffect } from 'react';
import Todo from './components/Todo';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 从 localStorage 加载主题设置
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <main 
      className={`min-h-screen py-10 transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
      }`}
    >
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      <Todo isDark={isDark} />
    </main>
  );
} 