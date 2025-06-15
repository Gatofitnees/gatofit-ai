
import React from 'react';
import { cn } from '@/lib/utils';

const AIWelcomeScreen: React.FC = () => {
  return (
    <div className="text-center text-muted-foreground py-16">
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden",
        "animate-gatofit-pulse"
      )}>
        <img src="https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/gatofit%20logo%20APP.png" alt="Gatofit Avatar" className="w-full h-full object-cover" />
      </div>
      <h2 className="text-lg font-semibold mb-2">¡Hola! Soy Gatofit</h2>
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
