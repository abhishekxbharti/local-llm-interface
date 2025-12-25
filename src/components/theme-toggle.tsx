"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ModeToggle({ 
  isCollapsed = false, 
  className = "" 
}: { 
  isCollapsed?: boolean;
  className?: string;
}) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={cn(className, "")}
      onClick={toggleTheme}
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  )
}


