import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterRequest, UserInfo } from '@/app/types/user';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    const { username, password, email, nickname } = body;

    // 验证必填字段
    if (!username || !password || !email) {
      return NextResponse.json(
        { error: '用户名、密码和邮箱为必填项' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: '邮箱已被使用' },
        { status: 400 }
      );
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        password: hashedPassword,
        email,
        nickname: nickname || username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        createdAt: new Date(),
        settings: {
          create: {
            theme: 'system',
            language: 'zh',
            todoSortBy: 'createdAt',
            todoSortOrder: 'desc',
            showCompletedTodos: true,
            enableAIAssistant: true,
            enableEmailNotification: false,
            defaultPriority: 'medium',
            defaultCategory: '个人'
          }
        }
      },
      include: {
        settings: true
      }
    });

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
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
} 