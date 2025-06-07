import { NextResponse } from 'next/server';
import { prisma } from '@/types/prisma';

if (!prisma) {
  throw new Error('Prisma client is not properly initialized');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Action is required and must be a string' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Data is required and must be an object' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'createSession':
        const session = await prisma.chatSession.create({
          data: {
            userId: data.userId,
            context: JSON.stringify(data.context || {}),
            projectId: data.context?.projectId || null,
            taskId: data.context?.taskId || null,
            employeeId: data.context?.employeeId || null,
          },
          select: {
            id: true,
            userId: true,
            context: true,
            projectId: true,
            taskId: true,
            employeeId: true,
            createdAt: true,
            updatedAt: true
          }
        });
        return NextResponse.json({ success: true, data: session });

      case 'getSession':
        if (!data.chatId || typeof data.chatId !== 'string') {
          return NextResponse.json(
            { success: false, error: 'chatId is required and must be a string' },
            { status: 400 }
          );
        }

        try {
          const chatSession = await prisma.chatSession.findUnique({
            where: { id: data.chatId },
            select: {
              id: true,
              userId: true,
              context: true,
              projectId: true,
              taskId: true,
              employeeId: true,
              createdAt: true,
              updatedAt: true
            }
          });

          if (!chatSession) {
            return NextResponse.json(
              { success: false, error: 'Chat session not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({ success: true, data: chatSession });
        } catch (error) {
          console.error('Error fetching chat session:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to fetch chat session' },
            { status: 500 }
          );
        }

      case 'saveMessage':
        // Validate inputs
        if (!data.chatId || typeof data.chatId !== 'string') {
          return NextResponse.json(
            { success: false, error: 'chatId is required and must be a string' },
            { status: 400 }
          );
        }
        
        if (data.role !== 'user' && data.role !== 'assistant') {
          return NextResponse.json(
            { success: false, error: 'Invalid role. Must be "user" or "assistant"' },
            { status: 400 }
          );
        }
        
        if (!data.content || typeof data.content !== 'string') {
          return NextResponse.json(
            { success: false, error: 'Content is required and must be a string' },
            { status: 400 }
          );
        }

        try {
          const message = await prisma.chatMessage.create({
            data: {
              chatId: data.chatId,
              content: data.content,
              role: data.role,
            },
            select: {
              id: true,
              content: true,
              role: true,
              chatId: true,
              createdAt: true,
              updatedAt: true
            }
          });
          return NextResponse.json({ success: true, data: message });
        } catch (error) {
          console.error('Error saving message:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to save message' },
            { status: 500 }
          );
        }

      case 'getMessages':
        if (!data.chatId || typeof data.chatId !== 'string') {
          return NextResponse.json(
            { success: false, error: 'chatId is required and must be a string' },
            { status: 400 }
          );
        }

        try {
          const messages = await prisma.chatMessage.findMany({
            where: { chatId: data.chatId },
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              content: true,
              role: true,
              chatId: true,
              createdAt: true,
              updatedAt: true
            }
          });
          return NextResponse.json({ success: true, data: messages });
        } catch (error) {
          console.error('Error fetching messages:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to fetch messages' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
