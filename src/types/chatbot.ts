import { User } from "@prisma/client";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  chatId: string;
  createdAt: Date;
  updatedAt: Date;
  error?: boolean; // Indicates if there was an error with this message
}

export interface ChatSession {
  id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  employeeId?: string;
  context: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContext {
  projectId?: string;
  taskId?: string;
  employeeId?: string;
  currentDateTime: string;
  user: User;
  project?: {
    id: string;
    name: string;
    description: string;
  };
  task?: {
    id: string;
    title: string;
    description: string;
    status: string;
  };
  employee?: {
    id: string;
    name: string;
    joiningDate: Date;
    basicSalary: number;
  };
}
