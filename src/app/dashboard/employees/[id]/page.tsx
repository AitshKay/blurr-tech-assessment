import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { getEmployeeById } from "@/app/actions/employees";
import { deleteEmployeeAction } from "@/app/actions/delete-employee";
import { format } from 'date-fns';
import { DeleteEmployeeButton } from "@/components/employees/delete-employee-button";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: employee } = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  const handleDelete = async () => {
    'use server';
    const result = await deleteEmployeeAction(id);
    if (result.success) {
      // The actual redirect happens in the form action
      return { success: true };
    }
    throw new Error(result.message || 'Failed to delete employee');
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
            <h1 className="text-3xl font-bold">{employee.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Employee ID: {employee.employeeId}
          </p>
        </div>
        <div className="flex space-x-2">
          <DeleteEmployeeButton id={employee.id} redirectUrl="/dashboard/employees" />
          <Button asChild>
            <Link href={`/dashboard/employees/${employee.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{employee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{employee.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joining Date</p>
                <p className="font-medium">
                  {format(new Date(employee.joiningDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Basic Salary</p>
                <p className="font-medium">
                  ${employee.basicSalary.toLocaleString()}
                </p>
              </div>
              {('email' in employee && employee.email) ? (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{String(employee.email)}</p>
                </div>
              ) : null}
              {('phone' in employee && employee.phone) ? (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{String(employee.phone)}</p>
                </div>
              ) : null}
              {('address' in employee && employee.address) ? (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{String(employee.address)}</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
