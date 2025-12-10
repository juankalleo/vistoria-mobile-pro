import { useVistoriaStore } from "@/store/useVistoriaStore";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { formatPlaca, formatTelefone } from "@/utils/formatters";

const tipoVeiculoOptions = [
  { value: "carro", label: "Carro" },
  { value: "moto", label: "Moto" },
  { value: "caminhao", label: "Caminhão" },
  { value: "van", label: "Van" },
  { value: "onibus", label: "Ônibus" },
  { value: "outro", label: "Outro" },
];

export function InfoGeraisTab() {
  const { currentVistoria, updateField } = useVistoriaStore();

  if (!currentVistoria) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Nº da Ficha"
          value={currentVistoria.numero}
          readOnly
          className="bg-muted font-mono font-bold"
        />
        <FormInput
          label="Placa"
          value={currentVistoria.placa}
          onChange={(e) => updateField("placa", formatPlaca(e.target.value))}
          placeholder="AAA1A23"
          maxLength={10}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Data"
          value={currentVistoria.data}
          readOnly
          className="bg-muted"
        />
        <FormInput
          label="Hora"
          value={currentVistoria.hora}
          readOnly
          className="bg-muted"
        />
      </div>

      <FormInput
        label="Seguradora"
        value={currentVistoria.seguradora}
        onChange={(e) => updateField("seguradora", e.target.value)}
        placeholder="Ex: Porto Seguro"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Veículo"
          value={currentVistoria.veiculo}
          onChange={(e) => updateField("veiculo", e.target.value)}
          placeholder="Ex: Civic"
        />
        <FormInput
          label="Cor"
          value={currentVistoria.cor}
          onChange={(e) => updateField("cor", e.target.value)}
          placeholder="Ex: Prata"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Ano"
          value={currentVistoria.ano}
          onChange={(e) => updateField("ano", e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="Ex: 2023"
          inputMode="numeric"
        />
        <FormSelect
          label="Tipo de Veículo"
          value={currentVistoria.tipoVeiculo}
          onChange={(e) => updateField("tipoVeiculo", e.target.value)}
          options={tipoVeiculoOptions}
          placeholder="Selecione..."
        />
      </div>

      <FormInput
        label="Nome do Segurado"
        value={currentVistoria.segurado}
        onChange={(e) => updateField("segurado", e.target.value)}
        placeholder="Ex: João da Silva"
      />

      <FormInput
        label="Local"
        value={currentVistoria.local}
        onChange={(e) => updateField("local", e.target.value)}
        placeholder="Ex: Av. Paulista, 1000"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Telefone"
          value={currentVistoria.telefone}
          onChange={(e) => updateField("telefone", formatTelefone(e.target.value))}
          placeholder="(11) 99999-9999"
          inputMode="tel"
        />
        <FormInput
          label="Destino"
          value={currentVistoria.destino}
          onChange={(e) => updateField("destino", e.target.value)}
          placeholder="Ex: Oficina Centro"
        />
      </div>
    </div>
  );
}
