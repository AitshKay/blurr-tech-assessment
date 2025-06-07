import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Define the expected request body type
interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  projectId: string;
  assignedToId?: string | null;
  dueDate?: string | null;
  reminderDate?: string | null;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const tasks = await prisma.task.findMany({
      where: {
        project: {
          userId: session.user.id,
        },
        ...(projectId && { projectId: projectId as string }), // Filter by projectId if provided
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return as array for backward compatibility
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body: CreateTaskRequest = await request.json();
    
    // Validate required fields
    if (!body.title || !body.status || !body.priority || !body.projectId) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['title', 'status', 'priority', 'projectId']
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the task with optional assignedToId
    const taskData: any = {
      title: body.title,
      status: body.status,
      priority: body.priority,
      projectId: body.projectId,
      description: body.description || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      reminderDate: body.reminderDate ? new Date(body.reminderDate) : null,
    };
    
    // Only add assignedTo if it's provided and not an empty string
    if (body.assignedToId) {
      taskData.assignedTo = {
        connect: { id: body.assignedToId }
      };
    }
    
    const task = await prisma.task.create({
      data: taskData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
