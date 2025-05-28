
import React from 'react';

interface CameraLoadingOverlayProps {
  isVisible: boolean;
}

export const CameraLoadingOverlay: React.FC<CameraLoadingOverlayProps> = ({
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
      <div className="neu-card p-6 text-center max-w-xs mx-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
        <p className="text-white font-medium mb-1">Analizando imagen</p>
        <p className="text-white/70 text-sm">
          Detectando alimentos y calculando nutrientes...
        </p>
      </div>
    </div>
  );
};
