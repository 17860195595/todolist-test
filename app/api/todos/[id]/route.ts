import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// 更新待办事项
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const todoId = params.id;
    const body = await request.json();

    // 检查待办事项是否存在且属于当前用户
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId
      }
    });

    if (!existingTodo) {
      return NextResponse.json(
        { error: '待办事项不存在' },
        { status: 404 }
      );
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        text: body.text,
        completed: body.completed,
        priority: body.priority,
        category: body.category
      }
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('更新待办事项失败:', error);
    return NextResponse.json(
      { error: '更新待办事项失败' },
      { status: 500 }
    );
  }
}

// 删除待办事项
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const todoId = params.id;

    // 检查待办事项是否存在且属于当前用户
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId
      }
    });

    if (!existingTodo) {
      return NextResponse.json(
        { error: '待办事项不存在' },
        { status: 404 }
      );
    }

    await prisma.todo.delete({
      where: { id: todoId }
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除待办事项失败:', error);
    return NextResponse.json(
      { error: '删除待办事项失败' },
      { status: 500 }
    );
  }
} 