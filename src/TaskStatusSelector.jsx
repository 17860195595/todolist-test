// 导入必要的库和样式
import React from 'react';
import './App.css';

// 定义任务状态选择组件
const TaskStatusSelector = ({ task, onTaskStatusChange }) => {
  const handleStatusChange = (e) => {
    onTaskStatusChange(task.id, e.target.value);
  };

  return (
    <select onChange={handleStatusChange} className="task-status-selector">
      <option value="待完成">待完成</option>
      <option value="进行中">进行中</option>
      <option value="已完成">已完成</option>
    </select>
  );
};

// 导出组件
export default TaskStatusSelector;