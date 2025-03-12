// 导入必要的库和样式
import React from 'react';
import './App.css';

// 定义任务分类组件
const TaskCategory = ({ task, onTaskCategoryChange }) => {
  const handleCategoryChange = (e) => {
    onTaskCategoryChange(task.id, e.target.value);
    console.log(1111);
    
  };

  return (
    <select onChange={handleCategoryChange} className="task-category-selector">
      <option value="工作">工作</option>
      <option value="学习">学习</option>
      <option value="生活">生活</option>
    </select>
  );
};

// 导出组件
export default TaskCategory;