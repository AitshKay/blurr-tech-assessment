'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Project, Status } from '@prisma/client';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { deleteProject } from '@/app/actions/projects';
import { toast } from 'sonner';

// Extend the Project type to ensure createdAt is always defined
type ProjectWithCreatedAt = Project & {
  createdAt: string;
};

// Status badge component to display status with appropriate colors
const StatusBadge = ({ status }: { status: Status }) => {
  const statusColors = {
    [Status.TODO]: 'bg-yellow-100 text-yellow-800',
    [Status.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [Status.REVIEW]: 'bg-purple-100 text-purple-800',
    [Status.DONE]: 'bg-green-100 text-green-800',
    [Status.BLOCKED]: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default function ProjectTable() {
  const [projects, setProjects] = useState<ProjectWithCreatedAt[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          // Ensure all projects have a createdAt field
          const projectsWithCreatedAt = data.map((project: Project) => ({
            ...project,
            createdAt: project.createdAt || new Date().toISOString()
          }));
          setProjects(projectsWithCreatedAt);
        } else {
          console.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const result = await deleteProject(id);
      if (result.success) {
        toast.success('Project deleted');
        setProjects(projects.filter(project => project.id !== id));
      } else {
        toast.error(result.error || 'Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No projects found. Create your first project to get started.
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No projects found. Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell className="max-w-xs truncate">{project.description || '-'}</TableCell>
            <TableCell>
              <StatusBadge status={project.status} />
            </TableCell>
            <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  title="View Project"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/dashboard/projects/${project.id}/edit`)}
                  title="Edit Project"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(project.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Project"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
