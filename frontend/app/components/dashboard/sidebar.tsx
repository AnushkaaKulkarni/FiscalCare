"use client";

import React from "react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
}

export function Sidebar({ activeSection, onSectionChange, isOpen }: SidebarProps) {
  const sections = ["overview", "invoices", "gst-filing"];

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-0"
      } bg-gray-900 text-white transition-all duration-300 overflow-hidden`}
    >
      <h2 className="text-xl font-bold p-4 border-b border-gray-700">
        FiscalCare
      </h2>
      <nav className="flex flex-col p-2">
        {sections.map((sec) => (
          <button
            key={sec}
            className={`text-left px-4 py-2 rounded-md mb-1 ${
              activeSection === sec
                ? "bg-gray-700"
                : "hover:bg-gray-800 text-gray-300"
            }`}
            onClick={() => onSectionChange(sec)}
          >
            {sec.charAt(0).toUpperCase() + sec.slice(1)}
          </button>
        ))}
      </nav>
    </div>
  );
}
