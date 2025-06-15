
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ProgressRing from '@/components/ProgressRing';
import Button from '@/components/Button';
import { AlertTriangle } from 'lucide-react';

interface ProcessingFoodCardProps {
  imageUrl: string;
  className?: string;
  error?: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

const processingSteps = [
  { message: "Analizando imagen...", progress: 15 },
  { message: "Identificando alimentos...", progress: 35 },
  { message: "Calculando calorías...", progress: 55 },
  { message: "Estimando macros...", progress: 75 },
  { message: "Revisando ingredientes...", progress: 90 },
  { message: "Casi listo...", progress: 98 },
];

export const ProcessingFoodCard: React.FC<ProcessingFoodCardProps> = ({
  imageUrl,
  className,
  error,
  onRetry,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (error) return; // Stop interval on error

    const interval = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex + 1 < processingSteps.length) {
          return prevIndex + 1;
        }
        clearInterval(interval);
        return prevIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [error]);

  const currentStep = processingSteps[currentStepIndex];

  return (
    <div
      className={cn(
        "neu-card-inset opacity-90",
        !error && "animate-pulse",
        className
      )}
    >
      <div className="flex h-28 overflow-hidden">
        <div className="relative w-28 h-28 flex-shrink-0">
          <img
            src={imageUrl}
            alt="Procesando alimento"
            className="w-full h-full object-cover"
          />
          {!error && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-l-xl">
              <ProgressRing progress={currentStep.progress} size={50} strokeWidth={5} className="text-primary" />
              <span className="absolute text-xs font-bold text-white">
                {currentStep.progress}%
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 p-3 flex flex-col justify-center items-center bg-muted/20">
          {error ? (
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h4 className="text-sm font-semibold text-destructive">Error de análisis</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3 px-2">
                {error}
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={onRetry} size="sm" variant="secondary">
                  Reintentar
                </Button>
                <Button onClick={onCancel} size="sm" variant="outline">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm font-medium text-muted-foreground text-center">
                {currentStep.message}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
