import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { LoginRequest, UserInfo } from '@/app/types/user';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码为必填项' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        settings: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const token = generateToken(user.id);

    // 构造返回的用户信息
    const userInfo: UserInfo = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt.getTime(),
      settings: {
        theme: user.settings.theme as 'light' | 'dark' | 'system',
        language: user.settings.language as 'zh' | 'en',
        todoSortBy: user.settings.todoSortBy as 'createdAt' | 'priority' | 'category',
        todoSortOrder: user.settings.todoSortOrder as 'asc' | 'desc',
        showCompletedTodos: user.settings.showCompletedTodos,
        enableAIAssistant: user.settings.enableAIAssistant,
        enableEmailNotification: user.settings.enableEmailNotification,
        defaultPriority: user.settings.defaultPriority as 'low' | 'medium' | 'high',
        defaultCategory: user.settings.defaultCategory
      }
    };

    return NextResponse.json({
      user: userInfo,
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
} 