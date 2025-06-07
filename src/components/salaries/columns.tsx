import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Salary, Employee } from "@prisma/client";

type SalaryWithEmployee = Salary & {
  employee: Pick<Employee, 'id' | 'name' | 'employeeId'>;
};

export const columns: ColumnDef<SalaryWithEmployee>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "employee.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Employee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const salary = row.original;
      return (
        <div className="font-medium">
          <Link 
            href={`/dashboard/employees/${salary.employeeId}`}
            className="hover:underline"
          >
            {salary.employee.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {salary.employee.employeeId}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => {
      const date = new Date(row.getValue("month"));
      return <div>{format(date, "MMM yyyy")}</div>;
    },
  },
  {
    accessorKey: "basicSalary",
    header: () => <div className="text-right">Basic Salary</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("basicSalary"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "bonus",
    header: () => <div className="text-right">Bonus</div>,
    cell: ({ row }) => {
      const value = row.getValue("bonus");
      const amount = typeof value === 'number' ? value : 0;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <div className="text-right font-medium text-green-600">
          {amount > 0 ? `+${formatted}` : formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "deductions",
    header: () => <div className="text-right">Deductions</div>,
    cell: ({ row }) => {
      const value = row.getValue("deductions");
      const amount = typeof value === 'number' ? value : 0;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <div className="text-right font-medium text-destructive">
          {amount > 0 ? `-${formatted}` : formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "payableAmount",
    header: () => <div className="text-right">Payable Amount</div>,
    cell: ({ row }) => {
      const value = row.getValue("payableAmount");
      const amount = typeof value === 'number' ? value : 0;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-bold">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const salary = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/salaries/${salary.id}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/salaries/${salary.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={(e) => {
                e.preventDefault();
                // Handle delete action
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
