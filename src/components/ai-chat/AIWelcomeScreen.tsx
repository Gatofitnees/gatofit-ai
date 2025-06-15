
import React from 'react';

const AIWelcomeScreen: React.FC = () => {
  return (
    <div className="text-center text-muted-foreground py-16">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
        <img src="/lovable-uploads/4d4446c4-3e6c-420c-b845-c89b0f5bda48.png" alt="Gatofit Avatar" className="w-full h-full object-cover" />
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
