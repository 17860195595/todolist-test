// 导入必要的库和样式
import React, { useState } from 'react';
import './App.css';

// 定义任务创建组件
const TaskCreate = ({ onTaskCreate }) => {
  const [taskName, setTaskName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      onTaskCreate(taskName);
      setTaskName('');
    }
    console.log("submit");
    
  };

  return (
    <form onSubmit={handleSubmit} className="task-create-form">
      <input
        type="text"
        placeholder="输入任务名称"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="task-create-input"
      />
      <button type="submit" className="task-create-button">创建任务</button>
    </form>
  );
};

// 导出组件
export default TaskCreate;