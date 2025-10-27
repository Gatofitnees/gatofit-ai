
import React from 'react';
import { cn } from '@/lib/utils';
import { useBranding } from '@/contexts/BrandingContext';
import { Skeleton } from '@/components/ui/skeleton';

const AIWelcomeScreen: React.FC = () => {
  const { branding, loading } = useBranding();

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto mb-4" />
      </div>
    );
  }

  return (
    <div className="text-center text-muted-foreground py-16">
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden",
        "animate-gatofit-pulse"
      )}>
        <img 
          src={branding.logoImageUrl}
          alt={`${branding.companyName} Avatar`}
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-lg font-semibold mb-2">¡Hola! Soy {branding.companyName}</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Tu asistente personal de fitness. Pregúntame sobre entrenamientos, nutrición o tus objetivos.
      </p>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• "¿Qué ejercicios puedo hacer hoy?"</p>
        <p>• "¿Cuántas proteínas necesito?"</p>
        <p>• "Ayúdame con mi rutina de gym"</p>
      </div>
    </div>
  );
};

export default AIWelcomeScreen;
