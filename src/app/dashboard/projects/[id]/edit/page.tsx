'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Status } from '@prisma/client';
import { toast } from 'sonner';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: Status;
};

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project>({
    id: '',
    name: '',
    description: '',
    status: Status.TODO,
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          toast.error('Failed to fetch project');
          router.push('/dashboard/projects');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('An error occurred');
        router.push('/dashboard/projects');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });

      if (response.ok) {
        toast.success('Project updated successfully');
        router.push('/dashboard/projects');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="container p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground mt-1">
          Update the project details below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={project.name}
            onChange={(e) => setProject({ ...project, name: e.target.value })}
            placeholder="Project name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={project.description || ''}
            onChange={(e) => setProject({ ...project, description: e.target.value })}
            placeholder="Project description"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={project.status}
            onValueChange={(value: Status) => setProject({ ...project, status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Status).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/projects')}
          >
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
