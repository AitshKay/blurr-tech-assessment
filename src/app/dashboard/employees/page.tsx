import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, UserPlus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getAllEmployees } from "@/app/actions/employees";
import { DeleteEmployeeButton } from "@/components/employees/delete-employee-button";
import { Employee } from "@prisma/client";

type EmployeeWithEmail = Omit<Employee, 'email'> & {
  email: string | null;
}

export default async function EmployeesPage() {
  const result = await getAllEmployees();
  const employees: EmployeeWithEmail[] = result.data || [];

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Manage your organization's employees
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/employees/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="px-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                View and manage all employees in your organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employeeId}</TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>
                        {format(new Date(employee.joiningDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>${employee.basicSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <Link href={`/dashboard/employees/${employee.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <Link href={`/dashboard/employees/${employee.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <DeleteEmployeeButton id={employee.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}