'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskForm } from '@/components/task-form';
import { Status } from '@prisma/client';

type Project = {
  id: string;
  name: string;
};

export default function NewTaskPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          console.error('Failed to fetch project');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleTaskCreated = () => {
    router.push(`/dashboard/projects/${params.id}`);
  };

  if (loading || !project) {
    return (
      <div className="container p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Task</h1>
        <p className="text-muted-foreground mt-1">
          Add a new task to {project.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Fill in the details below to create a new task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm 
            projectId={project.id} 
            initialStatus={Status.TODO} 
            onClose={handleTaskCreated} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
