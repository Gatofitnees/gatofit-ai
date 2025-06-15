
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ProcessingFoodCardProps {
  imageUrl: string;
  className?: string;
}

const messages = [
  "Analizando imagen...",
  "Identificando alimentos...",
  "Calculando calorías...",
  "Estimando macros...",
  "Revisando ingredientes...",
  "Casi listo...",
];

export const ProcessingFoodCard: React.FC<ProcessingFoodCardProps> = ({
  imageUrl,
  className,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "neu-card-inset opacity-80 pointer-events-none animate-pulse",
        className
      )}
    >
      <div className="flex h-28">
        <div className="w-28 h-28 flex-shrink-0">
          <img
            src={imageUrl}
            alt="Procesando alimento"
            className="w-full h-full object-cover rounded-l-xl"
          />
        </div>
        <div className="flex-1 p-3 flex flex-col justify-center items-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">
              {messages[currentMessageIndex]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
