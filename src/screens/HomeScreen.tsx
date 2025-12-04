import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Vistoria } from "@/types/vistoria";
import { getAllVistorias, getNextVistoriaNumber } from "@/database/db";
import { useVistoriaStore } from "@/store/useVistoriaStore";
import { CardVistoria } from "@/components/CardVistoria";
import { Plus, Truck, Search } from "lucide-react";
import { FormInput } from "@/components/FormInput";
import { toast } from "@/hooks/use-toast";

export function HomeScreen() {
  const navigate = useNavigate();
  const { initNewVistoria, loadVistoria } = useVistoriaStore();
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVistorias();
  }, []);

  const loadVistorias = async () => {
    try {
      const data = await getAllVistorias();
      setVistorias(data);
    } catch (error) {
      console.error("Erro ao carregar vistorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewVistoria = async () => {
    const numero = await getNextVistoriaNumber();
    initNewVistoria(numero);
    navigate("/vistoria");
  };

  const handleView = (vistoria: Vistoria) => {
    loadVistoria(vistoria);
    navigate("/vistoria");
  };

  const handleShare = (vistoria: Vistoria) => {
    const message = `Vistoria #${vistoria.numero}\nPlaca: ${vistoria.placa}\nData: ${vistoria.data}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast({ title: "Abrindo WhatsApp..." });
  };

  const filteredVistorias = vistorias.filter(
    (v) => v.placa.toLowerCase().includes(search.toLowerCase()) || v.numero.includes(search) || v.segurado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Vistorias</h1>
            <p className="text-sm opacity-80">Sistema de Guincho</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por placa, número ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-background text-foreground"
          />
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-24 -mt-2">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : filteredVistorias.length > 0 ? (
          <div className="space-y-4">
            {filteredVistorias.map((vistoria) => (
              <CardVistoria
                key={vistoria.id}
                vistoria={vistoria}
                onView={() => handleView(vistoria)}
                onGeneratePDF={() => toast({ title: "Gerando PDF...", description: "Funcionalidade em desenvolvimento." })}
                onShare={() => handleShare(vistoria)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Truck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search ? "Nenhuma vistoria encontrada" : "Nenhuma vistoria cadastrada"}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Toque no botão + para criar uma nova
            </p>
          </div>
        )}
      </main>

      {/* FAB */}
      <button onClick={handleNewVistoria} className="floating-btn" aria-label="Nova vistoria">
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
