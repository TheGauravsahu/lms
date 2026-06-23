import { Moon, Sun, Monitor } from "lucide-react";
import { useThemeStore } from "@/store/theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHaptic } from "@/hooks/useHaptic";

const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme } = useThemeStore();
  const haptic = useHaptic();

  const handleSet = (t) => {
    haptic.tap();
    setTheme(t);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 cursor-pointer rounded-full ${className}`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Moon className="w-4 h-4" />
          ) : theme === "light" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Monitor className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {[
          { label: "Light", value: "light", Icon: Sun },
          { label: "Dark", value: "dark", Icon: Moon },
          { label: "System", value: "system", Icon: Monitor },
        ].map(({ label, value, Icon }) => (
          <DropdownMenuLabel
            key={value}
            onClick={() => handleSet(value)}
            className={`flex items-center gap-2 cursor-pointer text-sm font-medium hover:bg-secondary hover:rounded-sm transition-all ${
              theme === value ? "text-orange-500" : ""
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {theme === value && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuLabel>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
