
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '@/components/Button';
import { FoodAnalysisResult } from '@/hooks/useWebhookResponse';

interface FoodAnalysisPreviewProps {
  imageUrl: string;
  isAnalyzing: boolean;
  analysisResult: FoodAnalysisResult | null;
  analysisError: string | null;
  onClose: () => void;
  onRetry: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const progressMessages = [
  "Calculando macros",
  "Contando calorías", 
  "Identificando alimentos",
  "Analizando ingredientes"
];

export const FoodAnalysisPreview: React.FC<FoodAnalysisPreviewProps> = ({
  imageUrl,
  isAnalyzing,
  analysisResult,
  analysisError,
  onClose,
  onRetry,
  onSave,
  isSaving
}) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Simulate progress during analysis
  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0);
      setMessageIndex(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 90);
        
        // Change message based on progress
        if (newProgress > 70 && messageIndex < 3) {
          setMessageIndex(3);
        } else if (newProgress > 50 && messageIndex < 2) {
          setMessageIndex(2);
        } else if (newProgress > 30 && messageIndex < 1) {
          setMessageIndex(1);
        }
        
        return newProgress;
      });
    }, 800);

    return () => clearInterval(progressInterval);
  }, [isAnalyzing, messageIndex]);

  // Complete progress when analysis finishes
  useEffect(() => {
    if (analysisResult || analysisError) {
      setProgress(100);
    }
  }, [analysisResult, analysisError]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg font-medium">Análisis de Comida</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-white/10"
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="neu-card bg-background/95 backdrop-blur-sm p-6">
          {/* Image */}
          <div className="relative mb-6">
            <img 
              src={imageUrl} 
              alt="Comida analizada"
              className="w-full h-48 object-cover rounded-xl"
            />
            
            {/* Progress Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeDasharray={`${progress}, 100`}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <p className="text-white text-sm font-medium">
                    {progressMessages[messageIndex]}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error State */}
          {analysisError && (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">Hey, parece que eso no se come.</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No pudimos identificar el alimento en la imagen.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={onClose}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={onRetry}>
                  Intentar otra vez
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">¡Análisis completado!</span>
              </div>

              {/* Food Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold">{analysisResult.name}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">{analysisResult.calories}</div>
                    <div className="text-xs text-muted-foreground">kcal</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/20 rounded-lg">
                    <div className="text-lg font-bold">{analysisResult.servingSize} {analysisResult.servingUnit}</div>
                    <div className="text-xs text-muted-foreground">porción</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                    <div className="text-sm font-bold text-blue-500">{analysisResult.protein}g</div>
                    <div className="text-xs text-muted-foreground">Proteínas</div>
                  </div>
                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                    <div className="text-sm font-bold text-green-500">{analysisResult.carbs}g</div>
                    <div className="text-xs text-muted-foreground">Carbohidratos</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                    <div className="text-sm font-bold text-yellow-500">{analysisResult.fat}g</div>
                    <div className="text-xs text-muted-foreground">Grasas</div>
                  </div>
                </div>

                {/* Ingredients */}
                {analysisResult.ingredients && analysisResult.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Ingredientes identificados:</h4>
                    <div className="space-y-1">
                      {analysisResult.ingredients.slice(0, 3).map((ingredient, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {ingredient.name} ({ingredient.grams}g)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={onSave} 
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar comida"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
