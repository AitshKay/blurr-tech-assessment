import { Task, User, Status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTask } from "@/app/actions/tasks";
import { toast } from "sonner";

const statusColors = {
  [Status.TODO]: 'bg-gray-100 text-gray-800',
  [Status.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [Status.REVIEW]: 'bg-yellow-100 text-yellow-800',
  [Status.DONE]: 'bg-green-100 text-green-800',
  [Status.BLOCKED]: 'bg-red-100 text-red-800',
} as const;

interface TaskWithAssignee extends Task {
  assignedTo?: User | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface TaskCardProps {
  task: TaskWithAssignee;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

export function TaskCard({ task, onTaskUpdated, onTaskDeleted }: TaskCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setIsDeleting(true);
        const result = await deleteTask(task.id);
        if (result.success) {
          toast.success('Task deleted successfully');
          onTaskUpdated?.();
          onTaskDeleted?.();
        } else {
          throw new Error(result.error || 'Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/tasks/${task.id}/edit`);
  };
  return (
    <div className="bg-card p-4 rounded-lg border">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {task.description}
            </p>
          )}
          {task.assignedTo && (
            <p className="text-sm text-muted-foreground mt-1">
              Assigned to: {task.assignedTo.name}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status as Status] || 'bg-gray-100'}`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className="text-sm text-muted-foreground">
              Priority: {task.priority}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="w-full"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
