'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { KanbanBoard } from '@/components/kanban-board';
import { Status, Priority, type Task as PrismaTask } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: User;
}

interface Task extends Omit<PrismaTask, 'dueDate' | 'reminderDate' | 'createdAt' | 'updatedAt'> {
  project: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  dueDate: Date | null;
  reminderDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban');
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project details
      const projectRes = await fetch(`/api/projects/${params.id}`);
      if (!projectRes.ok) {
        throw new Error('Failed to fetch project');
      }
      const projectData = await projectRes.json();
      setProject(projectData);

      // Fetch tasks for the project
      const tasksRes = await fetch(`/api/tasks?projectId=${params.id}`);
      if (!tasksRes.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasksData = await tasksRes.json();
      
      // Transform tasks to match the Kanban board's expected format
      const formattedTasks = tasksData.map((task: any) => ({
        ...task,
        assignedTo: task.assignedTo ? {
          id: task.assignedTo.id,
          name: task.assignedTo.name || 'Unassigned',
          email: task.assignedTo.email || ''
        } : null,
        project: {
          id: task.project?.id,
          name: task.project?.name || 'No Project'
        },
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        reminderDate: task.reminderDate ? new Date(task.reminderDate) : null,
        reminderSent: task.reminderSent || false,
        assignedToId: task.assignedTo?.id || null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.id]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshTasks = useCallback(async () => {
    try {
      const tasksRes = await fetch(`/api/tasks?projectId=${params.id}`);
      if (!tasksRes.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasksData = await tasksRes.json();
      
      // Transform tasks to match the Kanban board's expected format
      const formattedTasks = tasksData.map((task: any) => ({
        ...task,
        assignedTo: task.assignedTo ? {
          id: task.assignedTo.id,
          name: task.assignedTo.name || 'Unassigned',
          email: task.assignedTo.email || ''
        } : null,
        project: {
          id: task.project?.id,
          name: task.project?.name || 'No Project'
        },
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        reminderDate: task.reminderDate ? new Date(task.reminderDate) : null,
        reminderSent: task.reminderSent || false,
        assignedToId: task.assignedTo?.id || null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while refreshing tasks');
    }
  }, [params.id]);

  // Refresh tasks when the tab changes to ensure we have the latest data
  useEffect(() => {
    if (activeTab === 'kanban') {
      refreshTasks();
    }
  }, [activeTab, refreshTasks]);

  const handleTaskUpdated = useCallback(() => {
    refreshTasks();
  }, [refreshTasks]);

  const handleTaskDeleted = useCallback(() => {
    refreshTasks();
  }, [refreshTasks]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <div className="rounded-lg border bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Project not found</h1>
        </div>
        <p className="text-muted-foreground">The requested project could not be found.</p>
        <Button onClick={() => router.push('/dashboard/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="container p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>
        {project.description && (
          <p className="text-muted-foreground ml-10">{project.description}</p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="details">Project Details</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <div className="rounded-lg border bg-card p-6">
            <KanbanBoard 
              tasks={tasks}
              projectId={project.id}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Task List</CardTitle>
                  <CardDescription>All tasks in this project</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/projects/${params.id}/tasks/new`}>
                    Add Task
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks found. Create your first task to get started.
                  </div>
                ) : (
                  <div className="border rounded-md divide-y">
                    {tasks.map((task) => {
                      const statusColors = {
                        [Status.TODO]: 'bg-gray-100 text-gray-800',
                        [Status.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
                        [Status.REVIEW]: 'bg-yellow-100 text-yellow-800',
                        [Status.DONE]: 'bg-green-100 text-green-800',
                        [Status.BLOCKED]: 'bg-red-100 text-red-800',
                      } as const;

                      return (
                        <div 
                          key={task.id} 
                          className="p-4 hover:bg-muted/50 cursor-pointer"
                          onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status as Status] || 'bg-gray-100'}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              {task.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>View and manage project information</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/projects/${params.id}/edit`}>
                    Edit Project
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                  <p className="text-base">{project.name}</p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === Status.DONE ? 'bg-green-100 text-green-800' :
                      project.status === Status.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                      project.status === Status.REVIEW ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                  <p className="text-base">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                  <p className="text-base">
                    {new Date(project.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {project.description && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line">{project.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
