import { useVistoriaStore } from "@/store/useVistoriaStore";
import { CarDataRow } from "@/components/CarDataRow";
import { DadosCarro } from "@/types/vistoria";

const dadosCarroItems: { key: keyof DadosCarro; label: string; category: string }[] = [
  // Iluminação
  { key: "farolDianteiro", label: "Farol Dianteiro", category: "Iluminação" },
  { key: "farolTraseiro", label: "Farol Traseiro", category: "Iluminação" },
  { key: "lanternaDianteira", label: "Lanterna Dianteira", category: "Iluminação" },
  { key: "lanternaTraseira", label: "Lanterna Traseira", category: "Iluminação" },
  
  // Para-choques e Capô
  { key: "paraChoqueDianteiro", label: "Para-choque Dianteiro", category: "Carroceria" },
  { key: "paraChoqueTraseiro", label: "Para-choque Traseiro", category: "Carroceria" },
  { key: "capo", label: "Capô", category: "Carroceria" },
  { key: "portaMalas", label: "Porta-malas", category: "Carroceria" },
  
  // Retrovisores
  { key: "retrovisiorEsquerdo", label: "Retrovisor Esquerdo", category: "Retrovisores" },
  { key: "retrovisiorDireito", label: "Retrovisor Direito", category: "Retrovisores" },
  
  // Portas
  { key: "portaDianteiraEsquerda", label: "Porta Diant. Esquerda", category: "Portas" },
  { key: "portaDianteiraDireita", label: "Porta Diant. Direita", category: "Portas" },
  { key: "portaTraseiraEsquerda", label: "Porta Tras. Esquerda", category: "Portas" },
  { key: "portaTraseiraDireita", label: "Porta Tras. Direita", category: "Portas" },
  
  // Painéis
  { key: "painelDianteiro", label: "Painel Dianteiro", category: "Painéis" },
  { key: "painelTraseiro", label: "Painel Traseiro", category: "Painéis" },
  
  // Vidros
  { key: "vidroParabrisaDianteiro", label: "Parabrisa Dianteiro", category: "Vidros" },
  { key: "vidroParabrisaTraseiro", label: "Parabrisa Traseiro", category: "Vidros" },
  { key: "vidroLateralDianteiroEsquerdo", label: "Vidro Lat. DE", category: "Vidros" },
  { key: "vidroLateralDianteiroDireito", label: "Vidro Lat. DD", category: "Vidros" },
  { key: "vidroLateralTraseiroEsquerdo", label: "Vidro Lat. TE", category: "Vidros" },
  { key: "vidroLateralTraseiroDireito", label: "Vidro Lat. TD", category: "Vidros" },
  
  // Para-lamas
  { key: "paraLamaDianteiroEsquerdo", label: "Para-lama DE", category: "Para-lamas" },
  { key: "paraLamaDianteiroDireito", label: "Para-lama DD", category: "Para-lamas" },
  { key: "paraLamaTraseiroEsquerdo", label: "Para-lama TE", category: "Para-lamas" },
  { key: "paraLamaTraseiroDireito", label: "Para-lama TD", category: "Para-lamas" },
  
  // Rodas e Pneus
  { key: "rodaDianteiraEsquerda", label: "Roda Diant. Esquerda", category: "Rodas" },
  { key: "rodaDianteiraDireita", label: "Roda Diant. Direita", category: "Rodas" },
  { key: "rodaTraseiraEsquerda", label: "Roda Tras. Esquerda", category: "Rodas" },
  { key: "rodaTraseiraDireita", label: "Roda Tras. Direita", category: "Rodas" },
  { key: "pneuDianteiroEsquerdo", label: "Pneu Diant. Esquerdo", category: "Rodas" },
  { key: "pneuDianteiroDireito", label: "Pneu Diant. Direito", category: "Rodas" },
  { key: "pneuTraseiroEsquerdo", label: "Pneu Tras. Esquerdo", category: "Rodas" },
  { key: "pneuTraseiroDireito", label: "Pneu Tras. Direito", category: "Rodas" },
  { key: "estepe", label: "Estepe", category: "Rodas" },
  
  // Acessórios
  { key: "macaco", label: "Macaco", category: "Acessórios" },
  { key: "chaveDeRoda", label: "Chave de Roda", category: "Acessórios" },
  { key: "triangulo", label: "Triângulo", category: "Acessórios" },
  { key: "extintor", label: "Extintor", category: "Acessórios" },
  { key: "tapetes", label: "Tapetes", category: "Acessórios" },
  { key: "radio", label: "Rádio", category: "Acessórios" },
  { key: "antena", label: "Antena", category: "Acessórios" },
  { key: "bateria", label: "Bateria", category: "Acessórios" },
  { key: "chave", label: "Chave", category: "Acessórios" },
  { key: "manual", label: "Manual", category: "Acessórios" },
  { key: "documentos", label: "Documentos", category: "Acessórios" },
];

export function DadosCarroTab() {
  const { currentVistoria, updateDadosCarro } = useVistoriaStore();

  if (!currentVistoria) return null;

  // Agrupar por categoria
  const categories = dadosCarroItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof dadosCarroItems>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-accent rounded-xl p-4 mb-4">
        <p className="text-sm font-medium text-accent-foreground mb-2">Legenda:</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 bg-success text-success-foreground rounded flex items-center justify-center text-xs font-bold">S</span>
            Sim
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 bg-destructive text-destructive-foreground rounded flex items-center justify-center text-xs font-bold">N</span>
            Não
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 bg-warning text-warning-foreground rounded flex items-center justify-center text-xs font-bold">I</span>
            Incompleto
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 bg-info text-info-foreground rounded flex items-center justify-center text-xs font-bold">A</span>
            Avariado
          </span>
        </div>
      </div>

      {Object.entries(categories).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <CarDataRow
                key={item.key}
                label={item.label}
                value={currentVistoria.dadosCarro[item.key]}
                onChange={(value) => updateDadosCarro(item.key, value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
