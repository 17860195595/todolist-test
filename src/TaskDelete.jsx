// 导入必要的库和样式
import React from 'react';
import './App.css';

// 定义任务删除组件
const TaskDelete = ({ task, onTaskDelete }) => {
  const handleDelete = () => {
    onTaskDelete(task.id);
  };

  return (
    <button onClick={handleDelete} className="task-delete-button">删除任务</button>
  );
};

// 导出组件
export default TaskDelete;