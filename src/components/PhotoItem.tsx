import { X } from "lucide-react";

interface PhotoItemProps {
  src: string;
  onRemove: () => void;
  index: number;
}

export function PhotoItem({ src, onRemove, index }: PhotoItemProps) {
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-muted animate-fade-in">
      <img
        src={src}
        alt={`Foto ${index + 1}`}
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg touch-manipulation"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="absolute bottom-2 left-2 bg-foreground/80 text-background text-xs px-2 py-1 rounded-lg font-medium">
        #{index + 1}
      </div>
    </div>
  );
}
