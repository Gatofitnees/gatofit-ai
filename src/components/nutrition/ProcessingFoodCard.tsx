
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ProgressRing from '@/components/ProgressRing';

interface ProcessingFoodCardProps {
  imageUrl: string;
  className?: string;
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
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex + 1 < processingSteps.length) {
          return prevIndex + 1;
        }
        clearInterval(interval);
        return prevIndex;
      });
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const currentStep = processingSteps[currentStepIndex];

  return (
    <div
      className={cn(
        "neu-card-inset opacity-90 animate-pulse",
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
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-l-xl">
            <ProgressRing progress={currentStep.progress} size={50} strokeWidth={5} className="text-primary" />
            <span className="absolute text-xs font-bold text-white">
              {currentStep.progress}%
            </span>
          </div>
        </div>
        <div className="flex-1 p-3 flex flex-col justify-center items-center bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm font-medium text-muted-foreground text-center">
              {currentStep.message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
