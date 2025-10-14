
import React from 'react';
import { AlertTriangle, ImageIcon, Camera } from 'lucide-react';
import Button from '@/components/Button';

interface CameraErrorDialogProps {
  isVisible: boolean;
  errorMessage: string;
  onUseGallery: () => void;
  onRetryCamera: () => void;
  isProcessing: boolean;
  isLoading: boolean;
}

// Detectar si es un error relacionado con HEIC
const isHeicError = (message: string): boolean => {
  return message.toLowerCase().includes('heic') || 
         message.toLowerCase().includes('heif') ||
         message.toLowerCase().includes('formato no soportado');
};

// Detectar si estamos en iOS
const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const CameraErrorDialog: React.FC<CameraErrorDialogProps> = ({
  isVisible,
  errorMessage,
  onUseGallery,
  onRetryCamera,
  isProcessing,
  isLoading
}) => {
  if (!isVisible) return null;

  const showHeicHelp = isHeicError(errorMessage) && isIOS();

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
      <div className="neu-card p-6 text-center max-w-xs mx-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          {showHeicHelp ? 'Formato No Soportado' : 'Error de Cámara'}
        </h3>
        <p className="text-white/70 text-sm mb-2">{errorMessage}</p>
        
        {showHeicHelp && (
          <div className="bg-white/5 rounded-lg p-3 mb-4 text-left">
            <p className="text-white/60 text-xs mb-2">
              💡 <strong>Sugerencia:</strong>
            </p>
            <p className="text-white/60 text-xs">
              Hubo un problema al convertir la imagen HEIC. Intenta tomar la foto directamente con el botón de cámara o usa una imagen en formato JPG/PNG.
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          {showHeicHelp ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onRetryCamera}
                disabled={isProcessing || isLoading}
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Tomar Foto Nueva
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onUseGallery}
                disabled={isProcessing || isLoading}
                className="w-full"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Intentar con Galería de Nuevo
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
