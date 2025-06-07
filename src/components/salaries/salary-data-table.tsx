"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";
import { getAllSalaries } from "@/app/actions/salaries";
import { DataTable } from "@/components/ui/data-table";
import { Salary, Employee } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

type SalaryWithEmployee = Salary & {
  employee: Pick<Employee, 'id' | 'name' | 'employeeId'>;
};

// Helper type to convert TanStack ColumnDef to DataTableColumn
type ConvertToDataTableColumn<T> = {
  id: string;
  header: React.ReactNode | ((props: any) => React.ReactNode);
  cell: (info: { row: { original: T; getValue: (key: string) => any } }) => React.ReactNode;
};

export function SalaryDataTable() {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const { data, isLoading, error } = useQuery<SalaryWithEmployee[]>({
    // @ts-ignore - TanStack Query v5 has different types
    queryKey: ["salaries"],
    queryFn: async () => {
      const result = await getAllSalaries();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch salaries');
      }
      return result.data as SalaryWithEmployee[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-md border">
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive p-4">
        <p className="text-destructive">
          Error loading salaries: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Salary Records</h2>
        <div className="flex items-center space-x-2">
          {selectedRows.length > 0 && (
            <Button variant="outline" size="sm" className="h-8">
              Export Selected
            </Button>
          )}
          <Button
            size="sm"
            className="h-8"
            onClick={() => router.push("/dashboard/salaries/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Salary
          </Button>
        </div>
      </div>

      <DataTable<SalaryWithEmployee>
        columns={columns.map(column => {
          const col = column as unknown as ColumnDef<SalaryWithEmployee>;
          return {
            id: col.id || (col as any).accessorKey || '',
            header: typeof col.header === 'function' ? 'Header' : String(col.header || ''),
            cell: ({ row }) => {
              const value = (col as any).accessorKey 
                ? row.original[(col as any).accessorKey as keyof SalaryWithEmployee]
                : '';
              
              if (col.cell) {
                const cellRenderer = col.cell as any;
                return cellRenderer({
                  row: {
                    original: row.original,
                    getValue: (key: string) => row.original[key as keyof SalaryWithEmployee]
                  }
                });
              }
              return String(value || '');
            },
          };
        })}
        data={data || []}
        onRowSelectionChange={setSelectedRows}
        filterColumn="employee.name"
        filterPlaceholder="Filter employees..."
      />
    </div>
  );
}
