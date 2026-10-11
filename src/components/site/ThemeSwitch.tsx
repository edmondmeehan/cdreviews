import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex shrink-0 items-center gap-2 text-ink-2" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <Sun size={15} aria-hidden="true" />
      <Switch
        aria-label="Dark mode"
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="h-6 w-10 focus-visible:ring-vermil focus-visible:ring-offset-bone data-[state=checked]:bg-ink data-[state=unchecked]:bg-ink [&>span]:bg-bone [&>span]:data-[state=checked]:translate-x-5"
      />
      <Moon size={15} aria-hidden="true" />
    </div>
  );
}