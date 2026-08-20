import { useState } from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme, type Theme } from "@/contexts/ThemeContext";

interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
  icon: LucideIcon;
}

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Claro",
    description: "Mantém a interface sempre clara.",
    icon: Sun,
  },
  {
    value: "system",
    label: "Sistema",
    description: "Acompanha a preferência do dispositivo.",
    icon: Monitor,
  },
  {
    value: "dark",
    label: "Escuro",
    description: "Reduz o brilho para ambientes com pouca luz.",
    icon: Moon,
  },
];

const themeIcons: Record<Theme, LucideIcon> = {
  light: Sun,
  system: Monitor,
  dark: Moon,
};

const themeLabels: Record<Theme, string> = {
  light: "Claro",
  system: "Sistema",
  dark: "Escuro",
};

interface ThemeToggleProps {
  /** Ícone fixo opcional para encaixar o seletor em um botão existente do topo. */
  triggerIcon?: LucideIcon;
  className?: string;
}

export function ThemeToggle({ triggerIcon: TriggerIcon, className }: ThemeToggleProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const ActiveIcon = TriggerIcon ?? themeIcons[theme];

  const handleThemeChange = (nextTheme: string) => {
    setTheme(nextTheme as Theme);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={className}
            aria-label={`Tema atual: ${themeLabels[theme]}. Alterar tema`}
            title="Alterar tema"
            data-testid="button-theme-toggle"
          />
        }
      >
        <ActiveIcon aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-72 p-2">
        <div className="flex flex-col gap-1 px-2 pb-2 pt-1">
          <PopoverTitle>Tema da interface</PopoverTitle>
          <PopoverDescription>Escolha como o GTF-Bot deve aparecer.</PopoverDescription>
        </div>
        <RadioGroup
          aria-label="Tema da interface"
          value={theme}
          onValueChange={handleThemeChange}
          className="gap-1"
        >
          {themeOptions.map(({ value, label, description, icon: Icon }) => (
            <label
              key={value}
              htmlFor={`theme-${value}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 outline-none transition-colors hover:bg-muted focus-within:bg-muted"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </span>
              <RadioGroupItem id={`theme-${value}`} value={value} aria-label={label} />
            </label>
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
}
