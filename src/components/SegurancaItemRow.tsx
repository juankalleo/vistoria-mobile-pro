import { StatusItem } from "@/types/vistoria";
import { cn } from "@/lib/utils";

interface SegurancaItemRowProps {
  label: string;
  value: StatusItem;
  onChange: (value: StatusItem) => void;
}

export function SegurancaItemRow({ label, value, onChange }: SegurancaItemRowProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
      <p className="text-sm font-medium text-foreground mb-3">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(value === 'S' ? null : 'S')}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all touch-manipulation",
            value === 'S'
              ? "bg-success text-success-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(value === 'N' ? null : 'N')}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all touch-manipulation",
            value === 'N'
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          Não
        </button>
      </div>
    </div>
  );
}
