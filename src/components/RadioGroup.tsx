import { cn } from "@/lib/utils";

interface RadioGroupProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({ label, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="w-full">
      <label className="form-label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 min-w-[80px] h-12 px-4 rounded-xl font-medium transition-all touch-manipulation border-2",
              value === option.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/50"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
