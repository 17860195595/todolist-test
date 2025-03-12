// 导入必要的库和样式
import React, { useState } from 'react';
import './App.css';

// 定义任务编辑组件
const TaskEdit = ({ task, onTaskEdit }) => {
  const [editedTaskName, setEditedTaskName] = useState(task.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editedTaskName.trim()) {
      onTaskEdit(task.id, editedTaskName);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-edit-form">
      <input
        type="text"
        placeholder="编辑任务名称"
        value={editedTaskName}
        onChange={(e) => setEditedTaskName(e.target.value)}
        className="task-edit-input"
      />
      <button type="submit" className="task-edit-button">保存修改</button>
    </form>
  );
};

// 导出组件
export default TaskEdit;