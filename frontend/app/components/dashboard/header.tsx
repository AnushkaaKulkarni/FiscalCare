"use client";

import React from "react";

interface DashboardHeaderProps {
  onToggleSidebar: () => void; // function prop type
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  return (
    <header className="flex justify-between items-center bg-white border-b p-4">
      <button
        onClick={onToggleSidebar}
        className="text-gray-700 font-semibold hover:text-black"
      >
        ☰ Menu
      </button>
      <h1 className="font-bold text-lg">FiscalCare Dashboard</h1>
    </header>
  );
}
