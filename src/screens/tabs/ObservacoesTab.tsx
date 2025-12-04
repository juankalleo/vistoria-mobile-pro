import { useVistoriaStore } from "@/store/useVistoriaStore";

export function ObservacoesTab() {
  const { currentVistoria, updateField } = useVistoriaStore();

  if (!currentVistoria) return null;

  return (
    <div className="animate-fade-in">
      <label className="form-label">Observações Gerais</label>
      <textarea
        value={currentVistoria.observacoes}
        onChange={(e) => updateField("observacoes", e.target.value)}
        placeholder="Digite aqui quaisquer observações relevantes sobre a vistoria, condições especiais do veículo, danos não listados, etc..."
        className="form-input w-full min-h-[300px] py-4 resize-none"
      />
    </div>
  );
}
