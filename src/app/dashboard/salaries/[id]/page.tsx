import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { getSalaryById } from "@/app/actions/salaries";
import { deleteSalaryAction } from "@/app/actions/salary-actions";

export default async function SalaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: salary } = await getSalaryById(id);

  if (!salary) {
    notFound();
  }

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
            <h1 className="text-3xl font-bold">Salary Details</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {salary.employee.name} - {format(new Date(salary.month), 'MMM yyyy')}
          </p>
        </div>
        <div className="flex space-x-2">
          <form action={deleteSalaryAction}>
            <input type="hidden" name="id" value={id} />
            <Button 
              type="submit" 
              variant="outline" 
              size="icon" 
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                if (!confirm('Are you sure you want to delete this salary record?')) {
                  e.preventDefault();
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete salary</span>
            </Button>
          </form>
          <Button asChild>
            <Link href={`/dashboard/salaries/${salary.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Salary Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Employee</p>
                <p className="font-medium">
                  <Link 
                    href={`/dashboard/employees/${salary.employeeId}`}
                    className="hover:underline"
                  >
                    {salary.employee.name}
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  {salary.employee.employeeId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Month</p>
                <p className="font-medium">
                  {format(new Date(salary.month), 'MMMM yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Basic Salary</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(salary.basicSalary)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bonus</p>
                <p className="font-medium text-green-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(salary.bonus)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="font-medium text-destructive">
                  -{new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(salary.deductions)}
                </p>
              </div>
              <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Payable</span>
                  <span className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(salary.payableAmount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
