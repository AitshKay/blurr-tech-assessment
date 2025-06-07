"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Employee, Salary } from "@prisma/client";

type EmployeeSalary = Salary & {
  employee: Pick<Employee, 'id' | 'name' | 'employeeId'>;
};

export function SalaryMonthlyTable() {
  const [date, setDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (date) {
      fetchSalaries();
    }
  }, [date]);

  const fetchSalaries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/salaries?month=${date?.toISOString()}`);
      const data = await response.json();
      
      if (data.success) {
        setSalaries(data.data);
      } else {
        toast.error(data.error || "Failed to fetch salaries");
      }
    } catch (error) {
      console.error("Error fetching salaries:", error);
      toast.error("Failed to fetch salaries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (employeeId: string, field: 'bonus' | 'deductions', value: number) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/salaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          month: date?.toISOString(),
          [field]: value,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSalaries(prev => 
          prev.map(salary => 
            salary.employeeId === employeeId 
              ? { 
                  ...salary, 
                  [field]: value, 
                  payableAmount: salary.basicSalary + (field === 'bonus' ? value : salary.bonus) - (field === 'deductions' ? value : salary.deductions) 
                }
              : salary
          )
        );
        toast.success("Salary updated successfully");
      } else {
        toast.error(data.error || "Failed to update salary");
      }
    } catch (error) {
      console.error("Error updating salary:", error);
      toast.error("Failed to update salary");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Monthly Salary Overview</CardTitle>
          <CardDescription>View and manage employee salaries for the selected month</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MMMM yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) {
                    const firstDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                    setDate(firstDayOfMonth);
                  }
                }}
                initialFocus
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Basic Salary</TableHead>
                <TableHead className="text-right">Bonus</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Payable Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries.length > 0 ? (
                salaries.map((salary) => (
                  <TableRow key={salary.employeeId}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{salary.employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {salary.employee.employeeId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(salary.basicSalary)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        className="w-24 ml-auto text-right"
                        value={salary.bonus}
                        min={0}
                        onChange={(e) => {
                          const newBonus = parseFloat(e.target.value) || 0;
                          setSalaries(prev => 
                            prev.map(s => 
                              s.employeeId === salary.employeeId 
                                ? { 
                                    ...s, 
                                    bonus: newBonus,
                                    payableAmount: s.basicSalary + newBonus - s.deductions
                                  } 
                                : s
                            )
                          );
                        }}
                        onBlur={(e) => handleSave(salary.employeeId, 'bonus', parseFloat(e.target.value) || 0)}
                        disabled={isSaving}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        className="w-24 ml-auto text-right"
                        value={salary.deductions}
                        min={0}
                        onChange={(e) => {
                          const newDeductions = parseFloat(e.target.value) || 0;
                          setSalaries(prev => 
                            prev.map(s => 
                              s.employeeId === salary.employeeId 
                                ? { 
                                    ...s, 
                                    deductions: newDeductions,
                                    payableAmount: s.basicSalary + s.bonus - newDeductions
                                  } 
                                : s
                            )
                          );
                        }}
                        onBlur={(e) => handleSave(salary.employeeId, 'deductions', parseFloat(e.target.value) || 0)}
                        disabled={isSaving}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(salary.payableAmount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No salary records found for the selected month
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
