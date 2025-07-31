import { useThemeStore } from "../stores/themeStore";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="bg-gray-300 dark:bg-gray-700" // Light: gray-300, Dark: gray-700 (adjust as needed)
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-gray-800" /> // Darker text for light bg
      ) : (
        <Sun className="h-5 w-5 text-yellow-300" /> // Brighter for dark bg
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
