import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalaryDataTable } from "@/components/salaries/salary-data-table";
import { SalaryMonthlyTable } from "@/components/salaries/salary-monthly-table";

export const metadata: Metadata = {
  title: "Salaries | Blurr HR",
  description: "Manage employee salaries and compensation",
};

export default function SalariesPage() {
  return (
    <div className="container p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salary Management</h1>
          <p className="text-muted-foreground">
            View and manage employee salaries, bonuses, and deductions
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/salaries/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Salary Record
          </a>
        </Button>
      </div>
      
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Overview</TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="space-y-4">
          <SalaryMonthlyTable />
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <SalaryDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
