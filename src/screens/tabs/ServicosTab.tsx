import { useVistoriaStore } from "@/store/useVistoriaStore";
import { FormInput } from "@/components/FormInput";
import { RadioGroup } from "@/components/RadioGroup";
import { ToggleButton } from "@/components/ToggleButton";
import { formatQuilometragem } from "@/utils/formatters";

const tipoServicoOptions = [
  { value: "muck", label: "Muck" },
  { value: "guincho", label: "Guincho" },
  { value: "plataforma", label: "Plataforma" },
  { value: "taxi", label: "Táxi" },
];

const pneusOptions = [
  { value: "novos", label: "Novos" },
  { value: "bons", label: "Bons" },
  { value: "ruins", label: "Ruins" },
];

const combustivelOptions = [
  { value: "1/4", label: "1/4" },
  { value: "1/2", label: "1/2" },
  { value: "3/4", label: "3/4" },
  { value: "cheio", label: "Cheio" },
];

export function ServicosTab() {
  const { currentVistoria, updateField } = useVistoriaStore();

  if (!currentVistoria) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <RadioGroup
        label="Tipo de Serviço"
        options={tipoServicoOptions}
        value={currentVistoria.tipoServico}
        onChange={(value) => updateField("tipoServico", value)}
      />

      <RadioGroup
        label="Condição dos Pneus"
        options={pneusOptions}
        value={currentVistoria.condicaoPneus}
        onChange={(value) => updateField("condicaoPneus", value)}
      />

      <ToggleButton
        label="Possui Documento?"
        value={currentVistoria.temDocumento}
        onChange={(value) => updateField("temDocumento", value)}
      />

      <RadioGroup
        label="Nível de Combustível"
        options={combustivelOptions}
        value={currentVistoria.nivelCombustivel}
        onChange={(value) => updateField("nivelCombustivel", value)}
      />

      <FormInput
        label="Quilometragem"
        value={currentVistoria.quilometragem}
        onChange={(e) => updateField("quilometragem", formatQuilometragem(e.target.value))}
        placeholder="Ex: 45.000"
        inputMode="numeric"
      />
    </div>
  );
}
