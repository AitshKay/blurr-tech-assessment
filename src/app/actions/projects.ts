'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Import the Status type from Prisma client
import { Status } from '@prisma/client';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.nativeEnum(Status).default('TODO'),
});

type ProjectInput = z.infer<typeof projectSchema>;

export async function createProject(data: ProjectInput) {
  try {
    // Validate input
    const validatedData = projectSchema.parse(data);
    
    // Get the current user ID (in a real app, this would come from the session)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return { success: false, error: 'No user found' };
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    revalidatePath('/dashboard/projects');
    return { success: true, data: project };
  } catch (error) {
    console.error('Error creating project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create project' 
    };
  }
}

export async function updateProject(id: string, data: Partial<ProjectInput>) {
  try {
    // Validate input
    const validatedData = projectSchema.partial().parse(data);

    // Update the project
    const project = await prisma.project.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath('/dashboard/projects');
    return { success: true, data: project };
  } catch (error) {
    console.error('Error updating project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update project' 
    };
  }
}

export async function deleteProject(id: string) {
  try {
    // Delete the project
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath('/dashboard/projects');
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete project' 
    };
  }
}

export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    return { success: true, data: project };
  } catch (error) {
    console.error('Error fetching project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch project' 
    };
  }
}

export async function getAllProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: projects };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch projects' 
    };
  }
}
