
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UsageLimitsBanner } from '@/components/premium/UsageLimitsBanner';
import { useSubscription } from '@/hooks/useSubscription';

interface AIChatHeaderProps {
  onBack: () => void;
  onClear: () => void;
  hasMessages: boolean;
}

const AIChatHeader: React.FC<AIChatHeaderProps> = ({ onBack, onClear, hasMessages }) => {
  const { isPremium } = useSubscription();

  return (
    <div 
      className="flex items-center justify-between p-4 border-b border-muted/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10"
      style={{
        paddingTop: 'max(1rem, var(--safe-area-inset-top, 0px))',
        paddingLeft: 'max(1rem, var(--safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, var(--safe-area-inset-right, 0px))',
      }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 hover:bg-muted transition-colors active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className={cn(
          "w-8 h-8 rounded-full overflow-hidden flex items-center justify-center",
          "ring-2 ring-primary/20 transition-all duration-200"
        )}>
          <img 
            src="https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/gatofit%20logo%20APP.png" 
            alt="Gatofit Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2">
          <div>
            <h1 className="font-semibold text-lg text-foreground">Gatofit</h1>
            <p className="text-xs text-muted-foreground">Tu asistente personal de fitness</p>
          </div>
          {/* Mostrar banner de límites solo para usuarios no premium */}
          {!isPremium && (
            <UsageLimitsBanner type="ai_chat" className="ml-2" />
          )}
        </div>
      </div>
      {hasMessages && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs hover:bg-muted transition-colors active:scale-95"
        >
          Limpiar
        </Button>
      )}
    </div>
  );
};

export default AIChatHeader;
