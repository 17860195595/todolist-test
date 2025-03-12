import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// 获取所有待办事项
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const showCompleted = searchParams.get('showCompleted') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const category = searchParams.get('category');

    // 构建查询条件
    const where = {
      userId,
      ...(category && { category }),
      ...(!showCompleted && { completed: false })
    };

    const todos = await prisma.todo.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder.toLowerCase()
      }
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error('获取待办事项失败:', error);
    return NextResponse.json(
      { error: '获取待办事项失败' },
      { status: 500 }
    );
  }
}

// 创建待办事项
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text, priority, category } = body;

    if (!text) {
      return NextResponse.json(
        { error: '待办事项内容不能为空' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        id: uuidv4(),
        text,
        priority,
        category,
        userId
      }
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error('创建待办事项失败:', error);
    return NextResponse.json(
      { error: '创建待办事项失败' },
      { status: 500 }
    );
  }
} 