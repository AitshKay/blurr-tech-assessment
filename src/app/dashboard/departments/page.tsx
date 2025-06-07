'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ComingSoon } from "@/components/coming-soon";

export default function DepartmentsPage() {
  return (
    <div className="container p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Departments</h1>
        <p className="text-muted-foreground">Manage your organization's departments</p>
      </div>
      <ComingSoon />
    </div>
  );
}
