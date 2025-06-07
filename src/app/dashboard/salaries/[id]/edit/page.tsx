import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SalaryForm } from "@/components/salaries/salary-form";
import { getSalaryById, updateSalary } from "@/app/actions/salaries";
import { prisma } from "@/lib/prisma";
// Define the form values type to match the salary form
type FormValues = {
  employeeId: string;
  month: Date;
  basicSalary: number;
  bonus: number;
  deductions: number;
};

export default async function EditSalaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Fetch the current salary record
  const { data: salary } = await getSalaryById(id);
  
  if (!salary) {
    notFound();
  }

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

  const handleSubmit = async (data: FormValues) => {
    'use server';
    const formData = new FormData();
    formData.append('employeeId', data.employeeId);
    formData.append('month', data.month.toISOString());
    formData.append('basicSalary', data.basicSalary.toString());
    formData.append('bonus', data.bonus.toString());
    formData.append('deductions', data.deductions.toString());
    
    const result = await updateSalary(id, formData);
    if (result.success) {
      redirect('/dashboard/salaries');
    }
    return result;
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
            <h1 className="text-3xl font-bold">Edit Salary Record</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Update salary information for {salary.employee.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Information</CardTitle>
        </CardHeader>
        <CardContent>
          <SalaryForm 
            initialData={{
              ...salary,
              month: new Date(salary.month),
              employeeId: salary.employeeId || '',
            }} 
            employees={employees} 
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
