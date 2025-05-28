
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/Button';

interface NoFoodDialogProps {
  isVisible: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

export const NoFoodDialog: React.FC<NoFoodDialogProps> = ({
  isVisible,
  errorMessage,
  onRetry,
  onCancel
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
      <div className="neu-card p-6 text-center max-w-xs mx-4">
        <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">¡Ups!</h3>
        <p className="text-white/90 text-sm mb-6">
          {errorMessage || "¡Hey eso no se come! Parece que no se a detectado ninguna comida"}
        </p>
        <div className="space-y-3">
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            className="w-full"
          >
            Volver a intentar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
