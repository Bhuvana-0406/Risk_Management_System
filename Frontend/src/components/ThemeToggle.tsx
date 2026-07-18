// components/ThemeToggle.tsx
"use client";

import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import useDarkMode from "@/hooks/use-dark-mode";

const ThemeToggle = () => {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-5 w-5 text-yellow-400" />
      <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
      <Moon className="h-5 w-5 text-blue-500" />
    </div>
  );
};

export default ThemeToggle;
