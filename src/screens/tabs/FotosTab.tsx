import { useRef } from "react";
import { useVistoriaStore } from "@/store/useVistoriaStore";
import { PhotoItem } from "@/components/PhotoItem";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function FotosTab() {
  const { currentVistoria, addPhoto, removePhoto } = useVistoriaStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!currentVistoria) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

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
          description: "A foto foi salva com sucesso.",
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
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

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {currentVistoria.fotos.length > 0 ? (
        <div>
          <p className="form-label">
            {currentVistoria.fotos.length} foto(s) anexada(s)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentVistoria.fotos.map((foto, index) => (
              <PhotoItem
                key={index}
                src={foto}
                index={index}
                onRemove={() => removePhoto(index)}
              />
            ))}
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
    </div>
  );
}
