// 导入必要的库和样式
import React from 'react';
import './App.css';

// 定义任务优先级选择组件
const TaskPrioritySelector = ({ task, onTaskPriorityChange }) => {
  const handlePriorityChange = (e) => {
    onTaskPriorityChange(task.id, e.target.value);
  };

  return (
    <select onChange={handlePriorityChange} className="task-priority-selector">
      <option value="高">高</option>
      <option value="中">中</option>
      <option value="低">低</option>
    </select>
  );
};

// 导出组件
export default TaskPrioritySelector;