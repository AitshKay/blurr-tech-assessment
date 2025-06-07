"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProjectForm } from "@/components/projects/project-form";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/dashboard/projects');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to projects</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">New Project</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Create a new project
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm 
            onSubmit={handleSubmit}
            onSuccess={() => router.push('/dashboard/projects')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
