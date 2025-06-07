"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type FormProvider, useFormContext } from "react-hook-form";

// Define the form schema with validation rules
const formSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  month: z.date({
    required_error: 'Month is required',
  }),
  basicSalary: z.coerce.number().min(0, 'Basic salary must be a positive number'),
  bonus: z.coerce.number().min(0, 'Bonus must be a positive number').default(0),
  deductions: z.coerce.number().min(0, 'Deductions must be a positive number').default(0),
});

// Type for the form values
type FormValues = {
  employeeId: string;
  month: Date;
  basicSalary: number;
  bonus: number;
  deductions: number;
};

// Type for the form submission handler
type FormSubmitHandler = SubmitHandler<FormValues>;

// Type for employee data
type Employee = {
  id: string;
  name: string;
  employeeId: string;
  basicSalary: number;
};

interface SalaryFormProps {
  initialData?: {
    id?: string;
    employeeId: string;
    month: Date | string;
    basicSalary: number;
    bonus?: number;
    deductions?: number;
  };
  employees: Employee[];
  onSubmit: (data: FormValues) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
}

export function SalaryForm({ initialData, employees, onSubmit, onSuccess }: SalaryFormProps) {
  const router = useRouter();

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, // Type assertion needed for complex type inference
    defaultValues: {
      employeeId: initialData?.employeeId || '',
      month: initialData?.month ? new Date(initialData.month) : new Date(),
      basicSalary: initialData?.basicSalary || 0,
      bonus: initialData?.bonus || 0,
      deductions: initialData?.deductions || 0,
    },
  });

  const { isSubmitting } = form.formState;
  const selectedEmployeeId = form.watch('employeeId');

  // Set basic salary when employee is selected
  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      form.setValue('basicSalary', Number(employee.basicSalary));
    }
  };

  // Handle form submission
  const onSubmitHandler: FormSubmitHandler = async (formData) => {
    try {
      const result = await onSubmit(formData);
      
      if (result?.success) {
        toast.success(
          initialData ? "Salary updated successfully" : "Salary created successfully"
        );
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/salaries");
        }
      } else {
        toast.error(result?.error || "Something went wrong");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleEmployeeChange(value);
                  }}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Month</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(field.value, "MMM yyyy")
                        ) : (
                          <span>Pick a month</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      defaultMonth={field.value || new Date()}
                      toMonth={new Date()}
                      captionLayout="dropdown-buttons"
                      fromYear={new Date().getFullYear() - 10}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="basicSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Basic Salary</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-8"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bonus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bonus</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-8"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deductions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deductions</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-8"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payable Amount</span>
              <span className="text-xl font-bold">
                ${(
                  Number(form.watch('basicSalary')) + 
                  Number(form.watch('bonus') || 0) - 
                  Number(form.watch('deductions') || 0)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{initialData ? 'Update Salary' : 'Create Salary'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
