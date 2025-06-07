import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { taskId } = await params;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          // Task is assigned to the current user
          { assignedTo: { userId: session.user.id } },
          // OR task belongs to a project owned by the user
          { project: { userId: session.user.id } }
        ]
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
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { taskId } = await params;
    const updateData = await request.json();
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return new NextResponse('No update data provided', { status: 400 });
    }
    
    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];
      if (!validStatuses.includes(updateData.status)) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Invalid status',
            validStatuses
          }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify the task exists and belongs to a project owned by the user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { 
          userId: session.user.id 
        }
      },
      select: { 
        id: true,
        projectId: true,
        assignedToId: true
      }
    });

    if (!task) {
      return new NextResponse('Task not found or access denied', { status: 404 });
    }

    // Prepare the update data with only the fields that are being updated
    const dataToUpdate: any = {};
    
    // Only include fields that are actually being updated
    if ('title' in updateData) dataToUpdate.title = updateData.title;
    if ('description' in updateData) dataToUpdate.description = updateData.description;
    if ('status' in updateData) dataToUpdate.status = updateData.status;
    if ('priority' in updateData) dataToUpdate.priority = updateData.priority;
    
    // Handle assignedToId - it can be null to unassign
    if ('assignedToId' in updateData) {
      if (updateData.assignedToId === '' || updateData.assignedToId === null) {
        dataToUpdate.assignedToId = null;
      } else if (updateData.assignedToId) {
        // Only validate if we're assigning to someone
        const employee = await prisma.employee.findUnique({
          where: { id: updateData.assignedToId },
          select: { id: true }
        });
        
        if (!employee) {
          return new NextResponse(
            JSON.stringify({ 
              error: 'Invalid employee',
              message: 'The specified employee does not exist'
            }), 
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        dataToUpdate.assignedToId = updateData.assignedToId;
      }
    }
    
    // Handle date fields
    if ('dueDate' in updateData) {
      dataToUpdate.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }
    
    if ('reminderDate' in updateData) {
      dataToUpdate.reminderDate = updateData.reminderDate ? new Date(updateData.reminderDate) : null;
    }

    try {
      // Update the task
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: dataToUpdate,
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

      return NextResponse.json(updatedTask);
    } catch (error: any) {
      console.error('Error updating task:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2003') {
        // Check which foreign key constraint was violated
        const errorMessage = error.meta?.field_name?.includes('assignedToId')
          ? 'The specified employee does not exist'
          : 'Invalid reference in the update data';
          
        return new NextResponse(
          JSON.stringify({ 
            error: 'Invalid Data',
            message: errorMessage,
            details: {
              code: error.code,
              field: error.meta?.field_name
            }
          }), 
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Handle other Prisma errors
      if (error.code?.startsWith('P2')) {
        return new NextResponse(
          JSON.stringify({
            error: 'Database Error',
            message: 'An error occurred while updating the task',
            code: error.code
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Handle unexpected errors
      return new NextResponse(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while updating the task',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in PATCH handler:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { taskId } = await params;

    // Verify the task exists and belongs to a project owned by the user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { 
          userId: session.user.id 
        }
      },
      select: { 
        id: true,
        projectId: true
      }
    });

    if (!task) {
      return new NextResponse('Task not found or access denied', { status: 404 });
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}