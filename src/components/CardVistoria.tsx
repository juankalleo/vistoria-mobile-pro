import { Vistoria } from "@/types/vistoria";
import { Button } from "@/components/ui/button";
import { FileText, Share2, ChevronRight, Calendar, Clock, Car } from "lucide-react";

interface CardVistoriaProps {
  vistoria: Vistoria;
  onView: () => void;
  onGeneratePDF: () => void;
  onShare: () => void;
}

export function CardVistoria({ vistoria, onView, onGeneratePDF, onShare }: CardVistoriaProps) {
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Car className="w-4 h-4" />
          <span className="font-semibold text-primary">{vistoria.placa || "---"}</span>
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

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onGeneratePDF}
          className="flex-1 h-11"
        >
          <FileText className="w-4 h-4 mr-2" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="flex-1 h-11"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Enviar
        </Button>
        <Button
          onClick={onView}
          size="sm"
          className="flex-1 h-11"
        >
          Ver
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
