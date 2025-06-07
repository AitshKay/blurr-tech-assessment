"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EmployeeForm } from "@/components/employees/employee-form";
import { createEmployee } from "@/app/actions/employees";
import { useRouter } from "next/navigation";

export default function NewEmployeePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    return await createEmployee(data);
  };

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/employees">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to employees</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">New Employee</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Add a new employee to your organization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm 
            onSubmit={handleSubmit}
            onSuccess={() => router.push('/dashboard/employees')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
