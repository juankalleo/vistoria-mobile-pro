import { useVistoriaStore } from "@/store/useVistoriaStore";
import { SegurancaItemRow } from "@/components/SegurancaItemRow";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function DadosCarroTab() {
  const { currentVistoria, updateItensSeguranca, updateItensAusentes, updateAvarias } = useVistoriaStore();

  if (!currentVistoria) return null;

  const itensSeguranca = [
    { key: 'estepe' as const, label: 'Estepe' },
    { key: 'macaco' as const, label: 'Macaco' },
    { key: 'chaveDeRoda' as const, label: 'Chave de Roda' },
    { key: 'triangulo' as const, label: 'Triângulo' },
  ];

  const handleAusentesChange = (sim: boolean) => {
    updateItensAusentes(sim);
  };

  const handleAvariasChange = (sim: boolean) => {
    updateAvarias(sim);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Itens de Segurança
        </h3>
        
        {itensSeguranca.map((item) => (
          <SegurancaItemRow
            key={item.key}
            label={item.label}
            value={currentVistoria.itensSeguranca[item.key]}
            onChange={(value) => updateItensSeguranca(item.key, value)}
          />
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Faltando algum item?
        </h3>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant={currentVistoria.itensAusentes === true ? "default" : "outline"}
            className="flex-1 touch-manipulation"
            onClick={() => handleAusentesChange(true)}
          >
            Sim
          </Button>
          <Button
            type="button"
            variant={currentVistoria.itensAusentes === false ? "default" : "outline"}
            className="flex-1 touch-manipulation"
            onClick={() => handleAusentesChange(false)}
          >
            Não
          </Button>
        </div>

        {currentVistoria.itensAusentes === true && (
          <div className="space-y-2 animate-fade-in">
            <label htmlFor="descricao-ausentes" className="text-sm font-medium text-foreground">
              Descreva os itens que faltaram:
            </label>
            <Textarea
              id="descricao-ausentes"
              placeholder="Ex: Estepe e macaco ausentes..."
              value={currentVistoria.descricaoItensAusentes}
              onChange={(e) => updateItensAusentes(true, e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Possui avarias?
        </h3>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant={currentVistoria.possuiAvarias === true ? "default" : "outline"}
            className="flex-1 touch-manipulation"
            onClick={() => handleAvariasChange(true)}
          >
            Sim
          </Button>
          <Button
            type="button"
            variant={currentVistoria.possuiAvarias === false ? "default" : "outline"}
            className="flex-1 touch-manipulation"
            onClick={() => handleAvariasChange(false)}
          >
            Não
          </Button>
        </div>

        {currentVistoria.possuiAvarias === true && (
          <div className="space-y-2 animate-fade-in">
            <label htmlFor="descricao-avarias" className="text-sm font-medium text-foreground">
              Descreva as avarias encontradas:
            </label>
            <Textarea
              id="descricao-avarias"
              placeholder="Ex: Amassado no para-choque dianteiro, vidro trincado..."
              value={currentVistoria.descricaoAvarias}
              onChange={(e) => updateAvarias(true, e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>
        )}
      </div>
    </div>
  );
}
