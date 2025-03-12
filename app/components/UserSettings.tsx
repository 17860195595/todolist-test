import { useState, useEffect } from 'react';
import { UserSettings } from '@/app/types/user';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

export default function UserSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'zh',
    todoSortBy: 'createdAt',
    todoSortOrder: 'desc',
    showCompletedTodos: true,
    enableAIAssistant: true,
    enableEmailNotification: false,
    defaultPriority: 'medium',
    defaultCategory: '个人'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiClient.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error('加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (key: keyof UserSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await apiClient.updateSettings({ [key]: value });
      toast.success('设置已更新');
    } catch (error) {
      toast.error('更新设置失败');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">用户设置</h2>
      
      <div className="space-y-4">
        {/* 主题设置 */}
        <div>
          <label className="block text-sm font-medium mb-2">主题</label>
          <select
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
            <option value="system">跟随系统</option>
          </select>
        </div>

        {/* 语言设置 */}
        <div>
          <label className="block text-sm font-medium mb-2">语言</label>
          <select
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* 待办事项排序 */}
        <div>
          <label className="block text-sm font-medium mb-2">待办事项排序</label>
          <div className="flex gap-2">
            <select
              value={settings.todoSortBy}
              onChange={(e) => handleChange('todoSortBy', e.target.value)}
              className="flex-1 p-2 border rounded"
            >
              <option value="createdAt">创建时间</option>
              <option value="priority">优先级</option>
              <option value="category">分类</option>
            </select>
            <select
              value={settings.todoSortOrder}
              onChange={(e) => handleChange('todoSortOrder', e.target.value)}
              className="w-24 p-2 border rounded"
            >
              <option value="asc">升序</option>
              <option value="desc">降序</option>
            </select>
          </div>
        </div>

        {/* 显示已完成的待办事项 */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showCompletedTodos"
            checked={settings.showCompletedTodos}
            onChange={(e) => handleChange('showCompletedTodos', e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="showCompletedTodos">显示已完成的待办事项</label>
        </div>

        {/* AI 助手 */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableAIAssistant"
            checked={settings.enableAIAssistant}
            onChange={(e) => handleChange('enableAIAssistant', e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="enableAIAssistant">启用 AI 助手</label>
        </div>

        {/* 邮件通知 */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableEmailNotification"
            checked={settings.enableEmailNotification}
            onChange={(e) => handleChange('enableEmailNotification', e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="enableEmailNotification">启用邮件通知</label>
        </div>

        {/* 默认优先级 */}
        <div>
          <label className="block text-sm font-medium mb-2">默认优先级</label>
          <select
            value={settings.defaultPriority}
            onChange={(e) => handleChange('defaultPriority', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>

        {/* 默认分类 */}
        <div>
          <label className="block text-sm font-medium mb-2">默认分类</label>
          <input
            type="text"
            value={settings.defaultCategory}
            onChange={(e) => handleChange('defaultCategory', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </div>
  );
} 