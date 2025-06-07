"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteEmployeeAction } from "@/app/actions/delete-employee";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteEmployeeButtonProps {
  id: string;
  redirectUrl?: string;
}

export function DeleteEmployeeButton({ id, redirectUrl }: DeleteEmployeeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await deleteEmployeeAction(id);
      
      if (result.success) {
        toast.success("Employee deleted successfully");
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.refresh();
        }
      } else {
        throw new Error(result.message || "Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isLoading}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
