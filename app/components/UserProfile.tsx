import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { UpdateUserRequest, ChangePasswordRequest } from '@/app/types/user';

export default function UserProfile() {
  const [profile, setProfile] = useState({
    username: '',
    nickname: '',
    email: '',
    avatar: ''
  });

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiClient.getProfile();
      setProfile({
        username: data.username,
        nickname: data.nickname,
        email: data.email,
        avatar: data.avatar
      });
    } catch (error) {
      toast.error('加载用户资料失败');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData: UpdateUserRequest = {
        nickname: profile.nickname,
        email: profile.email,
        avatar: profile.avatar
      };
      await apiClient.updateProfile(updateData);
      toast.success('资料更新成功');
    } catch (error) {
      toast.error('资料更新失败');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    try {
      await apiClient.changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      setPasswords({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('密码修改成功');
    } catch (error) {
      toast.error('密码修改失败');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-8 p-4">
      {/* 基本资料 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">基本资料</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">用户名</label>
            <input
              type="text"
              value={profile.username}
              disabled
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">昵称</label>
            <input
              type="text"
              value={profile.nickname}
              onChange={e => setProfile(prev => ({ ...prev, nickname: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">邮箱</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">头像</label>
            <input
              type="text"
              value={profile.avatar}
              onChange={e => setProfile(prev => ({ ...prev, avatar: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt="头像预览"
                className="mt-2 w-20 h-20 rounded-full"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存修改
          </button>
        </form>
      </div>

      {/* 修改密码 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">修改密码</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">当前密码</label>
            <input
              type="password"
              value={passwords.oldPassword}
              onChange={e => setPasswords(prev => ({ ...prev, oldPassword: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">新密码</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={e => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">确认新密码</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={e => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            修改密码
          </button>
        </form>
      </div>
    </div>
  );
} 