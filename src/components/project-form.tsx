import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { ProjectWithStatus } from "@/types/project";
import { Status } from "@prisma/client";

interface ProjectFormProps {
  project?: ProjectWithStatus;
  onAddComplete?: () => void;
  onEditComplete?: () => void;
}

export function ProjectForm({ project, onAddComplete, onEditComplete }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState<Status>(
    project?.status as Status || Status.TODO
  );
  const { data: session } = useSession();

  const statusOptions = [
    { value: Status.TODO, label: 'To Do' },
    { value: Status.IN_PROGRESS, label: 'In Progress' },
    { value: Status.REVIEW, label: 'Review' },
    { value: Status.DONE, label: 'Done' },
    { value: Status.BLOCKED, label: 'Blocked' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) return;

    try {
      if (project) {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            name,
            description,
            status,
          },
        });
        onEditComplete?.();
      } else {
        await prisma.project.create({
          data: {
            name,
            description,
            status,
            userId: session.user.id,
          },
        });
        onAddComplete?.();
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleCancel = () => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setStatus((project.status as Status) || Status.TODO);
    } else {
      setName("");
      setDescription("");
      setStatus(Status.TODO);
    }
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as Status);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            onValueChange={handleStatusChange}
            value={status}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button type="submit">{project ? "Update" : "Add"} Project</Button>
          {project && (
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
