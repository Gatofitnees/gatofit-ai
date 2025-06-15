
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIChatHeaderProps {
  onBack: () => void;
  onClear: () => void;
  hasMessages: boolean;
}

const AIChatHeader: React.FC<AIChatHeaderProps> = ({ onBack, onClear, hasMessages }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-muted/30 bg-background sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
          <img src="https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/gatofit%20logo%20APP.png" alt="Gatofit Avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-semibold text-lg">Chatea con Gatofit</h1>
          <p className="text-xs text-muted-foreground">Tu asistente personal de fitness</p>
        </div>
      </div>
      {hasMessages && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs"
        >
          Limpiar
        </Button>
      )}
    </div>
  );
};

export default AIChatHeader;
