import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginProps {
  isDark: boolean;
  onLogin: (userInfo: UserInfo) => void;
}

export interface UserInfo {
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  createdAt: number;
}

const Login: React.FC<LoginProps> = ({ isDark, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = () => {
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请填写所有必填字段');
      return;
    }

    if (isLogin) {
      // 登录逻辑
      if (password === '123456') {
        const userInfo: UserInfo = {
          username,
          nickname: username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          email: '',
          createdAt: Date.now(),
        };
        onLogin(userInfo);
        localStorage.setItem('todolist_user_info', JSON.stringify(userInfo));
      } else {
        setError('密码错误');
      }
    } else {
      // 注册逻辑
      if (password.length < 6) {
        setError('密码长度至少6位');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      if (!validateEmail(email)) {
        setError('请输入有效的邮箱地址');
        return;
      }

      const userInfo: UserInfo = {
        username,
        nickname: nickname || username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        email,
        createdAt: Date.now(),
      };
      onLogin(userInfo);
      localStorage.setItem('todolist_user_info', JSON.stringify(userInfo));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${
          isDark ? 'bg-gray-800/50' : 'bg-white/80'
        } backdrop-blur-xl border ${
          isDark ? 'border-white/5' : 'border-gray-200/20'
        }`}
      >
        <motion.div 
          className="mb-8 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className={`text-3xl font-bold text-center ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              {isLogin ? '登录 TODOLIST' : '注册新账号'}
            </span>
          </h1>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-4 p-4 rounded-lg ${
              isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-600'
            }`}
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl transition-all ${
                isDark 
                  ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-700/70'
                  : 'bg-white text-gray-800 placeholder-gray-400 focus:bg-gray-50'
              } border ${
                isDark ? 'border-gray-600' : 'border-gray-200'
              } focus:border-blue-500 outline-none`}
              placeholder="请输入用户名"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  昵称
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl transition-all ${
                    isDark 
                      ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-700/70'
                      : 'bg-white text-gray-800 placeholder-gray-400 focus:bg-gray-50'
                  } border ${
                    isDark ? 'border-gray-600' : 'border-gray-200'
                  } focus:border-blue-500 outline-none`}
                  placeholder="请输入昵称（选填）"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl transition-all ${
                    isDark 
                      ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-700/70'
                      : 'bg-white text-gray-800 placeholder-gray-400 focus:bg-gray-50'
                  } border ${
                    isDark ? 'border-gray-600' : 'border-gray-200'
                  } focus:border-blue-500 outline-none`}
                  placeholder="请输入邮箱"
                />
              </div>
            </>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl transition-all ${
                isDark 
                  ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-700/70'
                  : 'bg-white text-gray-800 placeholder-gray-400 focus:bg-gray-50'
              } border ${
                isDark ? 'border-gray-600' : 'border-gray-200'
              } focus:border-blue-500 outline-none`}
              placeholder={isLogin ? "请输入密码" : "请设置密码（至少6位）"}
            />
          </div>

          {!isLogin && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl transition-all ${
                  isDark 
                    ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-700/70'
                    : 'bg-white text-gray-800 placeholder-gray-400 focus:bg-gray-50'
                } border ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
                } focus:border-blue-500 outline-none`}
                placeholder="请再次输入密码"
              />
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className={`w-full py-3 rounded-xl transition-all ${
              isDark 
                ? 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-400/80 hover:to-purple-400/80'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400'
            } text-white font-medium shadow-lg mt-6`}
          >
            {isLogin ? '登录' : '注册'}
          </motion.button>

          <div className="flex items-center justify-center mt-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className={`text-sm transition-colors ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
            </button>
          </div>

          {isLogin && (
            <p className={`text-sm text-center mt-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              测试账号可使用任意用户名，密码：123456
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 