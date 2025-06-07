'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { EmployeeForm } from "@/components/employees/employee-form";
import { getEmployeeById, updateEmployee } from "@/app/actions/employees";

interface EmployeeData {
  id?: string;
  employeeId: string;
  name: string;
  joiningDate: Date;
  basicSalary: number;
  [key: string]: any;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Get the ID from URL params
  const employeeId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!employeeId) return;

    const fetchEmployee = async () => {
      try {
        const { data } = await getEmployeeById(employeeId);
        if (data) {
          setEmployee({
            id: data.id,
            employeeId: data.employeeId,
            name: data.name,
            joiningDate: new Date(data.joiningDate),
            basicSalary: data.basicSalary
          });
        } else {
          router.push('/dashboard/employees');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        router.push('/dashboard/employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId, router]);

  const handleSubmit = async (data: any) => {
    if (!employeeId) {
      return { success: false, error: 'Invalid employee ID' };
    }

    try {
      setSubmitting(true);
      const result = await updateEmployee(employeeId, data);
      if (result.success) {
        router.push('/dashboard/employees');
        router.refresh();
      }
      return result;
    } catch (error) {
      console.error('Error updating employee:', error);
      return { success: false, error: 'Failed to update employee' };
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return null;
  }

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
            <h1 className="text-3xl font-bold">Edit Employee</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Update employee information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm 
            initialData={employee}
            onSubmit={handleSubmit}
            onSuccess={() => router.push('/dashboard/employees')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
