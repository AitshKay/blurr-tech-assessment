import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SalaryForm } from "@/components/salaries/salary-form";
import { createSalary } from "@/app/actions/salaries";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Add Salary | Blurr HR",
  description: "Add a new salary record",
};

export default async function NewSalaryPage() {
  // Fetch employees for the dropdown
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      employeeId: true,
      basicSalary: true,
    },
    orderBy: { name: 'asc' },
  });

  const handleSubmit = async (data: any) => {
    'use server';
    return await createSalary(data);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/salaries">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to salaries</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Add Salary Record</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Add a new salary record for an employee
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Information</CardTitle>
        </CardHeader>
        <CardContent>
          <SalaryForm 
            employees={employees}
            onSubmit={handleSubmit}
            onSuccess={() => window.location.href = '/dashboard/salaries'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
