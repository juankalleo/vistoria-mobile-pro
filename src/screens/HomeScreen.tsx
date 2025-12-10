import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Vistoria } from "@/types/vistoria";
import { getAllVistorias, getNextVistoriaNumber } from "@/database/db";
import { useVistoriaStore } from "@/store/useVistoriaStore";
import { CardVistoria } from "@/components/CardVistoria";
import { Plus, Search, Truck } from "lucide-react";
import { FormInput } from "@/components/FormInput";
import { toast } from "@/hooks/use-toast";
import { generateVistoriaPdf } from "@/lib/pdf";
import { cachePdfBlob } from "@/lib/offline";
import { saveVistoria } from "@/database/db";
import { arrayBufferToBase64 } from "@/lib/encoding";

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
      // Filtrar apenas vistorias salvas
      const vistoriasSalvas = data.filter((v) => v.vistoriaSalva === true);
      setVistorias(vistoriasSalvas);
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

  const openWhatsAppComposer = (message: string) => {
    const encoded = encodeURIComponent(message);
    const webUrl = `https://wa.me/?text=${encoded}`;
    const schemeUrl = `whatsapp://send?text=${encoded}`;
    const intentUrl = `intent://send?text=${encoded}#Intent;package=com.whatsapp;scheme=whatsapp;end`;

    return new Promise<void>((resolve) => {
      let handled = false;
      const onVisibilityChange = () => {
        // if page hidden, assume app handled the intent
        if (document.visibilityState === "hidden") handled = true;
      };

      document.addEventListener("visibilitychange", onVisibilityChange);

      // Try platform-specific open
      try {
        const isAndroid = /Android/i.test(navigator.userAgent);
        const openUrl = isAndroid ? intentUrl : schemeUrl;

        // open in same tab for schemes/intents so browser triggers app handler
        window.location.href = openUrl;
      } catch {
        // ignore
      }

      // fallback timer: if not handled within 1.4s, open web URL
      const timer = setTimeout(() => {
        if (!handled) {
          window.open(webUrl, "_blank");
        }
        document.removeEventListener("visibilitychange", onVisibilityChange);
        clearTimeout(timer);
        resolve();
      }, 1400);
    });
  };

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000 * 30);
  }

  const handleShare = async (vistoria: Vistoria) => {
    const message = `Vistoria #${vistoria.numero}\nPlaca: ${vistoria.placa}\nData: ${vistoria.data}`;
    const filename = `Vistoria_${vistoria.numero}.pdf`;

    try {
      toast({ title: "Gerando PDF..." });
      // generateVistoriaPdf deve retornar Blob (pdf.ts ajustado)
      const pdfBlob: Blob = await generateVistoriaPdf(vistoria, { autoSave: false });
      const file = new File([pdfBlob], filename, { type: "application/pdf" });

      // 1) tenta navigator.share diretamente (alguns navegadores suportam sem canShare)
      if (navigator.share) {
        try {
          await (navigator as any).share({ files: [file], title: `Vistoria #${vistoria.numero}`, text: message });
          toast({ title: "Compartilhado" });
          return;
        } catch (err) {
          // share lançou erro (ex: não suportado para arquivos) -> fallback abaixo
          console.debug("navigator.share falhou:", err);
        }
      }

      // 2) Se não suportar compartilhamento de arquivos: baixa o PDF e abre composer do WhatsApp
      // (usuário deve anexar o arquivo manualmente no WhatsApp)
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      toast({ title: "PDF baixado", description: "Abra o WhatsApp e anexe o arquivo ao enviar." });

      // tentar abrir o composer do WhatsApp (sem destinatário) — usuário escolhe o contato
      const encoded = encodeURIComponent(message);
      const isAndroid = /Android/i.test(navigator.userAgent);
      const scheme = isAndroid
        ? `intent://send?text=${encoded}#Intent;package=com.whatsapp;scheme=whatsapp;end`
        : `whatsapp://send?text=${encoded}`;
      try {
        // efetua a navegação para o esquema/intent
        window.location.href = scheme;
      } catch {
        window.open(`https://wa.me/?text=${encoded}`, "_blank");
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
      toast({ title: "Erro ao compartilhar", variant: "destructive" });
      // fallback final: abrir composer web
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }
  };

  const handleGeneratePDF = async (vistoria: Vistoria) => {
    // abre janela em branco imediatamente para não ser bloqueada por popup blocker
    const newWin = window.open("", "_blank");
    if (!newWin) {
      toast({ title: "Pop-up bloqueado", description: "Permita pop-ups neste site para visualizar o PDF." });
    } else {
      // opcional: mostra uma mensagem temporária enquanto gera
      newWin.document.title = "Gerando PDF...";
      newWin.document.body.innerText = "Gerando PDF, aguarde...";
    }

    try {
      toast({ title: "Gerando PDF..." });
      const pdfBlob = await generateVistoriaPdf(vistoria, { autoSave: false });

      // cache opcional
      const filename = `Vistoria_${vistoria.numero}.pdf`;
      try { await cachePdfBlob(filename, pdfBlob); } catch {}

      // salvar base64 no registro para offline
      const ab = await pdfBlob.arrayBuffer();
      const dataUrl = arrayBufferToBase64(ab);
      vistoria.pdfBase64 = dataUrl;
      await saveVistoria(vistoria);

      // abrir visualização apontando a janela previamente criada para um Object URL
      const url = URL.createObjectURL(pdfBlob);
      if (newWin) {
        newWin.location.href = url;
      } else {
        const opened = window.open(url, "_blank");
        if (!opened) window.location.href = url;
      }

      toast({ title: "PDF pronto", description: `Vistoria #${vistoria.numero}` });
      // revoga após 60s
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error("Erro ao gerar/abrir PDF:", err);
      // fecha a janela em branco se houver falha
      try { newWin?.close(); } catch {}
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
  };

  const filteredVistorias = vistorias.filter(
    (v) => v.placa.toLowerCase().includes(search.toLowerCase()) || v.numero.includes(search) || v.segurado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6 pb-8">
        <div className="flex items-center mb-4">
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
                onGeneratePDF={() => handleGeneratePDF(vistoria)}
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
