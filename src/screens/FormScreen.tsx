import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVistoriaStore } from "@/store/useVistoriaStore";
import { saveVistoria } from "@/database/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { InfoGeraisTab } from "./tabs/InfoGeraisTab";
import { ServicosTab } from "./tabs/ServicosTab";
import { MotivoTab } from "./tabs/MotivoTab";
import { DadosCarroTab } from "./tabs/DadosCarroTab";
import { ObservacoesTab } from "./tabs/ObservacoesTab";
import { DeclaracoesTab } from "./tabs/DeclaracoesTab";
import { FotosTab } from "./tabs/FotosTab";

const tabs = [
  { id: 0, label: "Info", shortLabel: "Info" },
  { id: 1, label: "Serviços", shortLabel: "Serv." },
  { id: 2, label: "Motivo", shortLabel: "Mot." },
  { id: 3, label: "Dados", shortLabel: "Dados" },
  { id: 4, label: "Obs", shortLabel: "Obs" },
  { id: 5, label: "Declar.", shortLabel: "Decl." },
  { id: 6, label: "Fotos", shortLabel: "Fotos" },
];

export function FormScreen() {
  const navigate = useNavigate();
  const { currentVistoria, activeTab, setActiveTab, reset } = useVistoriaStore();
  const [saving, setSaving] = useState(false);

  if (!currentVistoria) {
    navigate("/");
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveVistoria(currentVistoria);
      toast({ title: "Vistoria salva!", description: `Ficha #${currentVistoria.numero} salva com sucesso.` });
      reset();
      navigate("/");
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (window.confirm("Deseja sair sem salvar?")) {
      reset();
      navigate("/");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return <InfoGeraisTab />;
      case 1: return <ServicosTab />;
      case 2: return <MotivoTab />;
      case 3: return <DadosCarroTab />;
      case 4: return <ObservacoesTab />;
      case 5: return <DeclaracoesTab />;
      case 6: return <FotosTab />;
      default: return <InfoGeraisTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="p-2 -ml-2 touch-manipulation">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="font-bold">Vistoria #{currentVistoria.numero}</h1>
            <p className="text-xs opacity-80">{currentVistoria.placa || "Sem placa"}</p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm" variant="secondary">
            <Save className="w-4 h-4 mr-1" />
            Salvar
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-card border-b border-border p-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn("tab-button whitespace-nowrap", activeTab === tab.id ? "tab-button-active" : "tab-button-inactive")}
            >
              {tab.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">{renderTabContent()}</main>

      {/* Navigation */}
      <footer className="bg-card border-t border-border p-4">
        <div className="flex gap-3">
          <Button onClick={() => setActiveTab(Math.max(0, activeTab - 1))} disabled={activeTab === 0} variant="outline" className="flex-1 h-12">
            <ChevronLeft className="w-5 h-5 mr-1" /> Anterior
          </Button>
          <Button onClick={() => setActiveTab(Math.min(tabs.length - 1, activeTab + 1))} disabled={activeTab === tabs.length - 1} className="flex-1 h-12">
            Próximo <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
