// 导入必要的库和样式
import React, { useState } from 'react';
import './App.css';

// 定义任务标签组件
const TaskTag = ({ task, onTaskTagChange }) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      onTaskTagChange(task.id, tagInput);
      setTagInput('');
    }
  };

  return (
    <form onSubmit={handleAddTag} className="task-tag-form">
      <input
        type="text"
        placeholder="输入标签"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        className="task-tag-input"
      />
      <button type="submit" className="task-tag-button">添加标签</button>
    </form>
  );
};

// 导出组件
export default TaskTag;