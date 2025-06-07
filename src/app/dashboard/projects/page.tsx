'use client';

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Define a loading component
function ProjectTableLoading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// Dynamically import the ProjectTable component with SSR disabled
const ProjectTable = dynamic(
  () => import('@/components/projects/project-table') as any,
  { 
    ssr: false,
    loading: () => <ProjectTableLoading />
  }
);

export default function ProjectsPage() {
  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Suspense fallback={<ProjectTableLoading />}>
          <ProjectTable />
        </Suspense>
      </div>
    </div>
  );
}
