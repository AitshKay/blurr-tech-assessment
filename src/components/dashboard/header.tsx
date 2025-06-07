"use client";

import { Button } from "../../components/ui/button";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "../../components/theme-toggle";

export function Header() {
  const { theme } = useTheme();

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => {
          // Toggle mobile sidebar
          document.querySelector(".sidebar")?.classList.toggle("-translate-x-full");
        }}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <div className="flex-1">
        <h1 className="font-semibold text-lg">AI Assistant</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
