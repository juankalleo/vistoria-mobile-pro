import { cn } from "@/lib/utils";

interface ToggleButtonProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleButton({ label, value, onChange }: ToggleButtonProps) {
  return (
    <div className="w-full">
      <label className="form-label">{label}</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 h-12 rounded-xl font-medium transition-all touch-manipulation border-2",
            value === true
              ? "bg-success text-success-foreground border-success"
              : "bg-card text-foreground border-border hover:border-success/50"
          )}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 h-12 rounded-xl font-medium transition-all touch-manipulation border-2",
            value === false
              ? "bg-destructive text-destructive-foreground border-destructive"
              : "bg-card text-foreground border-border hover:border-destructive/50"
          )}
        >
          Não
        </button>
      </div>
    </div>
  );
}
