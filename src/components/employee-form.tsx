import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Employee } from "@prisma/client";
import React from "react";

interface EmployeeFormProps {
  employee?: Partial<Employee>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    employeeId: employee?.employeeId ?? "",
    name: employee?.name ?? "",
    joiningDate: employee?.joiningDate 
      ? format(new Date(employee.joiningDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    basicSalary: employee?.basicSalary?.toString() ?? ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) return;

    try {
      const employeeData = {
        employeeId: formData.employeeId,
        name: formData.name,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : new Date(),
        basicSalary: formData.basicSalary ? parseFloat(formData.basicSalary) : 0,
      };

      const url = employee?.id 
        ? `/api/employees` 
        : '/api/employees';
      const method = employee?.id ? 'PUT' : 'POST';
      const body = employee?.id 
        ? { id: employee.id, ...employeeData }
        : employeeData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save employee');
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert('Failed to save employee. Please try again.');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (employee) {
      setFormData({
        employeeId: employee.employeeId ?? "",
        name: employee.name ?? "",
        joiningDate: employee.joiningDate
          ? format(new Date(employee.joiningDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        basicSalary: employee.basicSalary?.toString() ?? ""
      });
    } else {
      setFormData({
        employeeId: "",
        name: "",
        joiningDate: format(new Date(), "yyyy-MM-dd"),
        basicSalary: ""
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            name="employeeId"
            required
            disabled={!!employee}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="joiningDate">Joining Date</Label>
          <Input
            id="joiningDate"
            name="joiningDate"
            type="date"
            value={formData.joiningDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="basicSalary">Basic Salary</Label>
          <Input
            id="basicSalary"
            name="basicSalary"
            type="number"
            value={formData.basicSalary}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type="submit">
            {employee?.id ? 'Update' : 'Add'} Employee
          </Button>
        </div>
      </div>
    </form>
  );
}
