import { useVistoriaStore } from "@/store/useVistoriaStore";
import { FormInput } from "@/components/FormInput";
import { cn } from "@/lib/utils";

const motivos = [
  { value: "acidente", label: "Acidente", icon: "💥" },
  { value: "roubo", label: "Roubo", icon: "🚨" },
  { value: "furto", label: "Furto", icon: "🔓" },
  { value: "pane", label: "Pane", icon: "⚠️" },
  { value: "combustivel", label: "Falta de Combustível", icon: "⛽" },
  { value: "pneu", label: "Pneu", icon: "🛞" },
  { value: "outro", label: "Outro", icon: "📝" },
];

export function MotivoTab() {
  const { currentVistoria, updateField } = useVistoriaStore();

  if (!currentVistoria) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <label className="form-label">Selecione o Motivo da Chamada</label>
      
      <div className="grid grid-cols-2 gap-3">
        {motivos.map((motivo) => (
          <button
            key={motivo.value}
            type="button"
            onClick={() => updateField("motivoChamada", motivo.value)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all touch-manipulation text-left",
              currentVistoria.motivoChamada === motivo.value
                ? "bg-primary/10 border-primary"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <span className="text-2xl mb-2 block">{motivo.icon}</span>
            <span className={cn(
              "font-medium",
              currentVistoria.motivoChamada === motivo.value
                ? "text-primary"
                : "text-foreground"
            )}>
              {motivo.label}
            </span>
          </button>
        ))}
      </div>

      {currentVistoria.motivoChamada === "outro" && (
        <FormInput
          label="Especifique o motivo"
          value={currentVistoria.motivoOutro}
          onChange={(e) => updateField("motivoOutro", e.target.value)}
          placeholder="Descreva o motivo..."
        />
      )}
    </div>
  );
}
