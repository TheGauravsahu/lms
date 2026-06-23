import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/hooks/useHaptic";

const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme } = useThemeStore();
  const haptic = useHaptic();

  const handleToggle = () => {
    haptic.tap();
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`h-8 w-8 cursor-pointer rounded-full hover:bg-secondary ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="w-4.5 h-4.5 text-orange-500 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      ) : (
        <Sun className="w-4.5 h-4.5 text-orange-500 transition-transform duration-500 rotate-0 hover:rotate-90" />
      )}
    </Button>
  );
};

export default ThemeToggle;
