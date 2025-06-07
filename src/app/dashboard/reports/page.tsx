'use client';

import React from "react";
import { ComingSoon } from "@/components/coming-soon";

export default function ReportsPage() {
  return (
    <div className="container p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and view reports</p>
      </div>
      <ComingSoon />
    </div>
  );
}
