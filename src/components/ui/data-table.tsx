import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-components";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Button } from "./button";
import { FileText } from "lucide-react";

export type DataTableColumn<TData> = {
  accessorKey?: keyof TData | string;
  header: ReactNode | ((props: any) => ReactNode);
  cell?: (info: { row: { original: TData; getValue: (key: string) => any } }) => ReactNode;
  id?: string;
};

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  onRowSelectionChange?: (selected: TData[]) => void;
  filterColumn?: string;
  filterPlaceholder?: string;
  loading?: boolean;
  error?: Error | null;
  emptyState?: ReactNode;
  className?: string;
  rowClassName?: string | ((row: TData) => string);
}

export function DataTable<TData>({
  columns,
  data = [],
  onRowClick,
  onRowSelectionChange,
  filterColumn,
  filterPlaceholder = "Filter...",
  loading = false,
  error = null,
  emptyState,
  className,
  rowClassName,
}: DataTableProps<TData>) {
  // Render header cell
  const renderHeader = (header: DataTableColumn<TData>['header']) => {
    if (typeof header === 'function') {
      return header({});
    }
    return header;
  };

  // Get row class name
  const getRowClassName = (row: TData) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row);
    }
    return rowClassName || '';
  };

  // Handle row click
  const handleRowClick = (row: TData) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm", className)}>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={column.id || `col-${index}`}
                  className="h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                >
                  {renderHeader(column.header)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-24 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-24 text-center text-destructive"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-6 w-6" />
                    <span>Error loading data: {error.message}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => {
                const rowKey = (row as any).id || `row-${rowIndex}`;
                const rowClass = getRowClassName(row);
                
                return (
                  <TableRow 
                    key={rowKey}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      rowClass
                    )}
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.map((column, colIndex) => {
                      const cellKey = `${rowKey}-col-${column.id || colIndex}`;
                      let cellContent: ReactNode = '';
                      
                      if (column.cell) {
                        // Use custom cell renderer if provided
                        cellContent = column.cell({ 
                          row: { 
                            original: row,
                            getValue: (key: string) => (row as any)[key]
                          }
                        });
                      } else if (column.accessorKey) {
                        // Fall back to accessing by accessorKey
                        cellContent = (row as any)[column.accessorKey as string];
                      }
                      
                      return (
                        <TableCell 
                          key={cellKey}
                          className="p-3 align-middle [&:has([role=checkbox])]:pr-0"
                        >
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : emptyState ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 p-0">
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-64 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">No data available</p>
                    <p className="text-xs text-muted-foreground">
                      There are no items to display
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination would go here */}
      <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
        <div className="text-sm">
          {data.length} {data.length === 1 ? 'item' : 'items'}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add AlertCircle icon component if not already available
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
