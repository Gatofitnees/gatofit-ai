
import React from 'react';
import { AlertTriangle, ImageIcon } from 'lucide-react';
import Button from '@/components/Button';

interface CameraErrorDialogProps {
  isVisible: boolean;
  errorMessage: string;
  onUseGallery: () => void;
  onRetryCamera: () => void;
  isProcessing: boolean;
  isLoading: boolean;
}

export const CameraErrorDialog: React.FC<CameraErrorDialogProps> = ({
  isVisible,
  errorMessage,
  onUseGallery,
  onRetryCamera,
  isProcessing,
  isLoading
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
      <div className="neu-card p-6 text-center max-w-xs mx-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Error de Cámara</h3>
        <p className="text-white/70 text-sm mb-4">{errorMessage}</p>
        <div className="space-y-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onUseGallery}
            disabled={isProcessing || isLoading}
            className="w-full"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Usar Galería
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetryCamera}
            disabled={isProcessing || isLoading}
            className="w-full"
          >
            Reintentar Cámara
          </Button>
        </div>
      </div>
    </div>
  );
};
