import { Project as PrismaProject, Status as PrismaStatus } from "@prisma/client";

export type ProjectStatus = PrismaStatus;

export interface Project extends PrismaProject {
  status: ProjectStatus;
}

export type ProjectWithStatus = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
