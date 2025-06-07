import { Employee } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

type EmployeeTableColumn = {
  accessorKey: keyof Employee | string;
  header: string;
  cell: (info: { row: { original: Employee; getValue: (key: string) => any } }) => React.ReactNode;
};

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const columns: EmployeeTableColumn[] = [
    {
      accessorKey: "employeeId",
      header: "Employee ID",
      cell: ({ row }) => <div className="font-medium">{row.original.employeeId}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "joiningDate",
      header: "Joining Date",
      cell: ({ row }) => new Date(row.original.joiningDate).toLocaleDateString(),
    },
    {
      accessorKey: "basicSalary",
      header: "Basic Salary",
      cell: ({ row }) => `$${row.original.basicSalary.toFixed(2)}`,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Handle edit
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              // Handle delete
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={employees} />;
}
