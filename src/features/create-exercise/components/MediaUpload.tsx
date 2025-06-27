
import React from "react";
import { Upload, X } from "lucide-react";
import { Card, CardBody } from "@/components/Card";

interface MediaUploadProps {
  mediaPreview: string | null;
  mediaFile: File | null;
  onFileChange: (file: File | null) => void;
  onRemoveMedia: () => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ mediaPreview, mediaFile, onFileChange, onRemoveMedia }) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <Card>
      <CardBody>
        {mediaPreview ? (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            {mediaFile?.type.startsWith('video/') ? (
              <video 
                src={mediaPreview} 
                className="w-full h-full object-cover"
                controls 
              />
            ) : (
              <img 
                src={mediaPreview} 
                className="w-full h-full object-cover"
                alt="Ejercicio" 
              />
            )}
            <button 
              onClick={onRemoveMedia}
              className="absolute top-2 right-2 bg-background/80 p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/40 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              Subir imagen o video
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Formatos: JPG, PNG, MP4 (máx. 10MB)
            </span>
            <input 
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,video/mp4"
              onChange={handleFileInputChange}
            />
          </label>
        )}
      </CardBody>
    </Card>
  );
};

export default MediaUpload;
