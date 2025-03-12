import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { UserSettings } from '@/app/types/user';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: string;
  category: string;
  createdAt: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState({
    text: '',
    priority: 'medium',
    category: '个人'
  });
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadSettings();
    loadTodos();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiClient.getSettings();
      setSettings(data);
      setNewTodo(prev => ({
        ...prev,
        priority: data.defaultPriority,
        category: data.defaultCategory
      }));
    } catch (error) {
      toast.error('加载设置失败');
    }
  };

  const loadTodos = async () => {
    try {
      const data = await apiClient.getTodos({
        showCompleted: settings?.showCompletedTodos,
        sortBy: settings?.todoSortBy,
        sortOrder: settings?.todoSortOrder
      });
      setTodos(data);
    } catch (error) {
      toast.error('加载待办事项失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.text.trim()) {
      toast.error('请输入待办事项内容');
      return;
    }

    try {
      const todo = await apiClient.createTodo(newTodo);
      setTodos(prev => [todo, ...prev]);
      setNewTodo({
        text: '',
        priority: settings?.defaultPriority || 'medium',
        category: settings?.defaultCategory || '个人'
      });
      toast.success('添加成功');
    } catch (error) {
      toast.error('添加失败');
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updatedTodo = await apiClient.updateTodo(todo.id, {
        completed: !todo.completed
      });
      setTodos(prev =>
        prev.map(t => (t.id === todo.id ? updatedTodo : t))
      );
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast.success('删除成功');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {/* 添加待办事项表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo.text}
            onChange={e => setNewTodo(prev => ({ ...prev, text: e.target.value }))}
            placeholder="添加新的待办事项..."
            className="flex-1 p-2 border rounded"
          />
          <select
            value={newTodo.priority}
            onChange={e => setNewTodo(prev => ({ ...prev, priority: e.target.value }))}
            className="w-24 p-2 border rounded"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
          <input
            type="text"
            value={newTodo.category}
            onChange={e => setNewTodo(prev => ({ ...prev, category: e.target.value }))}
            placeholder="分类"
            className="w-32 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            添加
          </button>
        </div>
      </form>

      {/* 待办事项列表 */}
      <div className="space-y-2">
        {todos.map(todo => (
          <div
            key={todo.id}
            className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleComplete(todo)}
              className="h-4 w-4"
            />
            <span
              className={`flex-1 ${
                todo.completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {todo.text}
            </span>
            <span
              className={`px-2 py-1 rounded text-sm ${
                todo.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : todo.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded text-sm">
              {todo.category}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 