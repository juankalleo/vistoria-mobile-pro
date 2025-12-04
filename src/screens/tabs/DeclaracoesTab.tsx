import { useState } from "react";
import { useVistoriaStore } from "@/store/useVistoriaStore";
import { FormInput } from "@/components/FormInput";
import { SignaturePad } from "@/components/SignaturePad";
import { Button } from "@/components/ui/button";
import { Pen, Check } from "lucide-react";

export function DeclaracoesTab() {
  const { currentVistoria, updateDeclaracaoEntrega, updateDeclaracaoRecebimento } = useVistoriaStore();
  const [showSignaturePad, setShowSignaturePad] = useState<"entrega" | "recebimento" | null>(null);

  if (!currentVistoria) return null;

  const handleSaveSignature = (signatureBase64: string) => {
    if (showSignaturePad === "entrega") {
      updateDeclaracaoEntrega("assinaturaBase64", signatureBase64);
      updateDeclaracaoEntrega("data", new Date().toLocaleDateString("pt-BR"));
      updateDeclaracaoEntrega("hora", new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    } else if (showSignaturePad === "recebimento") {
      updateDeclaracaoRecebimento("assinaturaBase64", signatureBase64);
      updateDeclaracaoRecebimento("data", new Date().toLocaleDateString("pt-BR"));
      updateDeclaracaoRecebimento("hora", new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }
    setShowSignaturePad(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Declaração de Entrega */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">📋 Declaração de Entrega</h3>
        
        <div className="bg-muted rounded-xl p-4 mb-4 text-sm text-muted-foreground">
          <p>
            Declaro para os devidos fins que recebi o veículo acima descrito em perfeitas condições 
            de uso e funcionamento, conforme vistoria realizada no ato da entrega.
          </p>
        </div>

        <div className="space-y-4">
          <FormInput
            label="Nome Completo"
            value={currentVistoria.declaracaoEntrega.nome}
            onChange={(e) => updateDeclaracaoEntrega("nome", e.target.value)}
            placeholder="Nome de quem entrega"
          />

          <FormInput
            label="RG"
            value={currentVistoria.declaracaoEntrega.rg}
            onChange={(e) => updateDeclaracaoEntrega("rg", e.target.value)}
            placeholder="00.000.000-0"
          />

          <div>
            <label className="form-label">Assinatura</label>
            {currentVistoria.declaracaoEntrega.assinaturaBase64 ? (
              <div className="relative">
                <img
                  src={currentVistoria.declaracaoEntrega.assinaturaBase64}
                  alt="Assinatura"
                  className="w-full h-32 object-contain bg-card border-2 border-border rounded-xl"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-lg flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Assinado
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSignaturePad("entrega")}
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowSignaturePad("entrega")}
                className="w-full h-32 border-2 border-dashed"
              >
                <Pen className="w-5 h-5 mr-2" />
                Toque para assinar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Declaração de Recebimento */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">📋 Declaração de Recebimento</h3>
        
        <div className="bg-muted rounded-xl p-4 mb-4 text-sm text-muted-foreground">
          <p>
            Declaro que recebi o veículo acima descrito conforme local combinado, 
            estando ciente de todas as condições descritas nesta vistoria.
          </p>
        </div>

        <div className="space-y-4">
          <FormInput
            label="Nome Completo"
            value={currentVistoria.declaracaoRecebimento.nome}
            onChange={(e) => updateDeclaracaoRecebimento("nome", e.target.value)}
            placeholder="Nome de quem recebe"
          />

          <FormInput
            label="RG"
            value={currentVistoria.declaracaoRecebimento.rg}
            onChange={(e) => updateDeclaracaoRecebimento("rg", e.target.value)}
            placeholder="00.000.000-0"
          />

          <div>
            <label className="form-label">Assinatura</label>
            {currentVistoria.declaracaoRecebimento.assinaturaBase64 ? (
              <div className="relative">
                <img
                  src={currentVistoria.declaracaoRecebimento.assinaturaBase64}
                  alt="Assinatura"
                  className="w-full h-32 object-contain bg-card border-2 border-border rounded-xl"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-lg flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Assinado
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSignaturePad("recebimento")}
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowSignaturePad("recebimento")}
                className="w-full h-32 border-2 border-dashed"
              >
                <Pen className="w-5 h-5 mr-2" />
                Toque para assinar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <SignaturePad
          onSave={handleSaveSignature}
          onCancel={() => setShowSignaturePad(null)}
        />
      )}
    </div>
  );
}
