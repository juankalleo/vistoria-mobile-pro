import { StatusItem } from "@/types/vistoria";
import { cn } from "@/lib/utils";

interface CarDataRowProps {
  label: string;
  value: StatusItem;
  onChange: (value: StatusItem) => void;
}

export function CarDataRow({ label, value, onChange }: CarDataRowProps) {
  const statuses: { key: StatusItem; label: string; className: string }[] = [
    { key: 'S', label: 'S', className: 'status-btn-s' },
    { key: 'N', label: 'N', className: 'status-btn-n' },
    { key: 'I', label: 'I', className: 'status-btn-i' },
    { key: 'A', label: 'A', className: 'status-btn-a' },
  ];

  return (
    <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
      <p className="text-sm font-medium text-foreground mb-3">{label}</p>
      <div className="flex gap-2">
        {statuses.map((status) => (
          <button
            key={status.key}
            type="button"
            onClick={() => onChange(value === status.key ? null : status.key)}
            className={cn(
              "status-btn touch-manipulation",
              status.className,
              value === status.key && "active"
            )}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
}
