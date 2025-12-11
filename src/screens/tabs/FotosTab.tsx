import { useRef, useState } from "react";
import { useVistoriaStore } from "@/store/useVistoriaStore";
import { PhotoItem } from "@/components/PhotoItem";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, AlertCircle, Video, X, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FotosTabProps {
  fotoStage?: "local-guincho" | "entregue"; // Se não informado, mostra ambos (compatibilidade)
}

export function FotosTab({ fotoStage }: FotosTabProps) {
  const { currentVistoria, addPhoto, removePhoto, markPhotoAsType, addVideo, removeVideo } = useVistoriaStore();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!currentVistoria) return null;

  // Se fotoStage = "local-guincho", mostra apenas fotos de local e guincho
  // Se fotoStage = "entregue", mostra apenas fotos de entregue
  const mostrarLocal = !fotoStage || fotoStage === "local-guincho";
  const mostrarGabarito = !fotoStage || fotoStage === "local-guincho";
  const mostrarEntregue = !fotoStage || fotoStage === "entregue";

  const isVistoriaSalva = currentVistoria.vistoriaSalva;
  const totalFotos = currentVistoria.fotos.length;
  const maxFotos = 5;
  const canAddMore = totalFotos < maxFotos;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (totalFotos >= maxFotos) {
      toast({
        title: "Limite de fotos atingido",
        description: `Máximo de ${maxFotos} fotos permitidas.`,
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo é 10MB por foto.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          addPhoto(result);
          toast({
            title: "Foto adicionada",
            description: "Selecione o tipo de foto para classificá-la.",
          });
          setSelectedPhotoIndex(currentVistoria.fotos.length); // O novo índice após adicionar
        };
        reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const handleMarkPhotoType = (type: 'veiculoNoLocal' | 'veiculoNoGabarito' | 'veiculoEntregue') => {
    if (selectedPhotoIndex !== null) {
      markPhotoAsType(selectedPhotoIndex, type);
      toast({
        title: "Foto classificada",
        description: `Foto marcada como: ${type === 'veiculoNoLocal' ? 'Veículo no Local' : type === 'veiculoNoGabarito' ? 'Veículo no Gabarito' : 'Veículo Entregue'}`,
      });
      setSelectedPhotoIndex(null);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const file = files[0];
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 100MB para vídeos.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      addVideo(result);
      toast({
        title: "Vídeo de segurança adicionado",
        description: "Vídeo salvo com sucesso.",
      });
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const requiredPhotos = [
    { key: 'veiculoNoLocal' as const, label: 'Veículo no Local', description: 'Foto do veículo no local de saída', stage: 'local-guincho' },
    { key: 'veiculoNoGabarito' as const, label: 'Veículo no Gabarito', description: 'Foto do veículo embarcado no guincho', stage: 'local-guincho' },
    { key: 'veiculoEntregue' as const, label: 'Veículo Entregue', description: 'Foto do veículo entregue no destino', stage: 'entregue' },
  ];

  const fotosVisiveis = requiredPhotos.filter(foto => {
    if (!fotoStage) return true; // Se sem fotoStage, mostra tudo (compatibilidade)
    return foto.stage === fotoStage;
  });

  const allRequiredPhotosPresent = 
    currentVistoria.fotosObrigatorias.veiculoNoLocal &&
    currentVistoria.fotosObrigatorias.veiculoNoGabarito &&
    currentVistoria.fotosObrigatorias.veiculoEntregue;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              {fotoStage === 'local-guincho' ? '2 Fotos Obrigatórias (Local e Guincho):' : 
               fotoStage === 'entregue' ? '1 Foto Obrigatória (Entrega):' :
               '3 Fotos Obrigatórias:'}
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {fotosVisiveis.map((photo) => (
                <li key={photo.key} className="flex items-start gap-2">
                  <span className={`inline-block w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                    currentVistoria.fotosObrigatorias[photo.key]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {currentVistoria.fotosObrigatorias[photo.key] ? '✓' : '○'}
                  </span>
                  <div>
                    <strong>{photo.label}</strong>
                    <p className="text-xs opacity-75">{photo.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {!isVistoriaSalva && canAddMore && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            className="h-20 flex-col gap-2"
          >
            <Camera className="w-6 h-6" />
            <span>Tirar Foto</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-20 flex-col gap-2"
          >
            <ImagePlus className="w-6 h-6" />
            <span>Anexar Foto</span>
          </Button>
        </div>
      )}

      {!isVistoriaSalva && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">Vídeo de Segurança</h4>
                <p className="text-xs text-blue-700">(Opcional)</p>
              </div>
            </div>
            {!currentVistoria.videoSeguranca && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
              >
                Adicionar
              </Button>
            )}
            {currentVistoria.videoSeguranca && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  removeVideo();
                  toast({ title: "Vídeo removido" });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {currentVistoria.videoSeguranca && (
            <p className="text-xs text-green-600 mt-2">✓ Vídeo salvo com sucesso</p>
          )}
        </div>
      )}

      {!isVistoriaSalva && !canAddMore && (
        <div className="bg-warning/10 border border-warning rounded-xl p-4">
          <p className="text-sm text-warning font-medium">
            Máximo de {maxFotos} fotos atingido. Remova uma foto para adicionar outra.
          </p>
        </div>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isVistoriaSalva}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isVistoriaSalva}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        className="hidden"
        disabled={isVistoriaSalva}
      />

      {selectedPhotoIndex !== null && !isVistoriaSalva && (
        <div className="bg-accent rounded-xl p-4 space-y-3 border-2 border-accent-foreground/20">
          <p className="text-sm font-medium text-foreground">
            Classificar foto #{selectedPhotoIndex + 1}:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {fotosVisiveis.map((photo) => {
              const isCurrentPhotoType = currentVistoria.fotoTypes[selectedPhotoIndex] === photo.key;
              const isTypeAlreadyUsed = currentVistoria.fotoTypes.some((t, idx) => t === photo.key && idx !== selectedPhotoIndex);
              
              return (
                <Button
                  key={photo.key}
                  variant={isCurrentPhotoType ? "default" : "outline"}
                  onClick={() => handleMarkPhotoType(photo.key)}
                  className="justify-start"
                  disabled={isTypeAlreadyUsed}
                  title={isTypeAlreadyUsed ? "Este tipo já foi atribuído a outra foto" : ""}
                >
                  {photo.label}
                  {isCurrentPhotoType && " ✓"}
                </Button>
              );
            })}
```
          </div>
          <Button
            variant="ghost"
            onClick={() => setSelectedPhotoIndex(null)}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      )}

      {currentVistoria.fotos.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="form-label">
              {currentVistoria.fotos.map((_, idx) => currentVistoria.fotoTypes?.[idx]).filter(t => {
                if (!fotoStage) return true;
                if (fotoStage === 'local-guincho') return t === 'veiculoNoLocal' || t === 'veiculoNoGabarito';
                if (fotoStage === 'entregue') return t === 'veiculoEntregue';
                return false;
              }).length}/{maxFotos} foto(s) anexada(s)
            </p>
            {allRequiredPhotosPresent && (
              <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-lg font-medium">
                Todas obrigatórias ✓
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentVistoria.fotos.map((foto, index) => {
              const fotoType = currentVistoria.fotoTypes?.[index];
              // Filtrar fotos baseado no fotoStage
              if (fotoStage === 'local-guincho' && fotoType !== 'veiculoNoLocal' && fotoType !== 'veiculoNoGabarito') {
                return null;
              }
              if (fotoStage === 'entregue' && fotoType !== 'veiculoEntregue') {
                return null;
              }
              
              return (
                <div
                  key={index}
                  onClick={() => !isVistoriaSalva && setSelectedPhotoIndex(index)}
                  className={!isVistoriaSalva ? "cursor-pointer" : ""}
                >
                  <PhotoItem
                    src={foto}
                    index={index}
                    onRemove={() => removePhoto(index)}
                    canRemove={!isVistoriaSalva}
                    fotoType={currentVistoria.fotoTypes?.[index]}
                    isMarkedAsType={!!currentVistoria.fotoTypes?.[index]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-muted rounded-2xl p-8 text-center">
          <ImagePlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Nenhuma foto anexada ainda.
            <br />
            Use os botões acima para adicionar fotos.
          </p>
        </div>
      )}

      {isVistoriaSalva && (
        <div className="bg-success/10 border border-success rounded-xl p-4 mt-4">
          <p className="text-sm text-success font-medium">
            ✓ Vistoria salva. Nenhuma alteração pode ser feita.
          </p>
        </div>
      )}
    </div>
  );
}
