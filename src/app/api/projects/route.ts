import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects - Get all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Get the first user (in a real app, you'd get this from the session)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 400 }
      );
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || 'TODO',
        userId: user.id,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
