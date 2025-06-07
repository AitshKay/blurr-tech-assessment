import { useState } from "react";
import { Task } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues } from "react-hook-form";
import * as z from "zod";
import { Priority, Status } from "@prisma/client";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  priority: z.enum([Priority.LOW, Priority.NORMAL, Priority.HIGH]),
  status: z.enum([Status.TODO, Status.IN_PROGRESS, Status.REVIEW, Status.DONE]),
  assignedToId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  projectId: string;
  initialStatus: Status;
  onClose: () => void;
}

export function TaskForm({ projectId, initialStatus, onClose }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: Priority.NORMAL,
      status: initialStatus,
      assignedToId: undefined, // Use undefined instead of empty string
    } as DefaultValues<TaskFormValues>,
  });

  const onSubmit = async (values: TaskFormValues) => {
    try {
      await prisma.task.create({
        data: {
          title: values.title,
          description: values.description,
          priority: values.priority,
          status: values.status,
          projectId,
          assignedToId: values.assignedToId === 'unassigned' ? null : values.assignedToId || null,
        },
      });
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter task description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={Priority.LOW}>Low</SelectItem>
                  <SelectItem value={Priority.NORMAL}>Normal</SelectItem>
                  <SelectItem value={Priority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={Status.TODO}>To Do</SelectItem>
                  <SelectItem value={Status.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={Status.REVIEW}>Review</SelectItem>
                  <SelectItem value={Status.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assignedToId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {/* TODO: Load employees from database */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Task</Button>
        </div>
      </form>
    </Form>
  );
}
