import { Vistoria } from "@/types/vistoria";
import { Button } from "@/components/ui/button";
import { FileText, Share2, ChevronRight, Calendar, Clock, Car, Video, Image } from "lucide-react";

interface CardVistoriaProps {
  vistoria: Vistoria;
  onView: () => void;
  onGeneratePDF: () => void;
  onShare: () => void;
}

export function CardVistoria({ vistoria, onView, onGeneratePDF, onShare }: CardVistoriaProps) {
  const hasVideo = !!vistoria.videoSeguranca;
  const hasPhotos = vistoria.fotos && vistoria.fotos.length > 0;

  const handleVideoClick = () => {
    if (hasVideo && vistoria.videoSeguranca) {
      const link = document.createElement('a');
      link.href = vistoria.videoSeguranca;
      link.download = `video-seguranca-${vistoria.numero}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadPhotos = async () => {
    if (!hasPhotos) return;

    try {
      // Importar jszip dinamicamente
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder("fotos");

      if (!folder) return;

      // Adicionar cada foto ao zip
      vistoria.fotos.forEach((fotoBase64, index) => {
        if (fotoBase64.startsWith('data:')) {
          const matches = fotoBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const ext = mimeType.split('/')[1] || 'jpg';
            folder.file(`foto-${index + 1}.${ext}`, base64Data, { base64: true });
          }
        }
      });

      // Gerar e baixar o arquivo zip
      const content = await folder.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `fotos-vistoria-${vistoria.numero}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Erro ao baixar fotos:', error);
    }
  };

  return (
    <div className="card-vistoria animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Vistoria #{vistoria.numero}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {vistoria.segurado || "Sem nome"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${hasVideo ? 'bg-green-500' : 'bg-red-500'}`} title={hasVideo ? 'Vídeo salvo' : 'Sem vídeo'} />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="w-4 h-4" />
            <span className="font-semibold text-primary">{vistoria.placa || "---"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{vistoria.data}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{vistoria.hora}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGeneratePDF}
            className="flex-1 h-10"
          >
            <FileText className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="flex-1 h-10"
          >
            <Share2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Enviar</span>
          </Button>
          {hasPhotos && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPhotos}
              className="flex-1 h-10"
              title={`Download de ${vistoria.fotos?.length || 0} foto(s)`}
            >
              <Image className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Fotos</span>
            </Button>
          )}
          {hasVideo && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVideoClick}
              className="flex-1 h-10"
              title="Download do vídeo de segurança"
            >
              <Video className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Vídeo</span>
            </Button>
          )}
        </div>
        <Button
          onClick={onView}
          size="sm"
          className="w-full h-11"
        >
          Ver Ficha
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
