
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/Button';
import { Camera, Image, X } from 'lucide-react';
import { useFoodCaptureWithLimits } from '@/hooks/useFoodCaptureWithLimits';
import { PremiumModal } from '@/components/premium/PremiumModal';
import { UsageLimitsBanner } from '@/components/premium/UsageLimitsBanner';
import { useSubscription } from '@/hooks/useSubscription';

interface FoodScanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured: (imageUrl: string) => void;
}

export const FoodScanDialog: React.FC<FoodScanDialogProps> = ({
  isOpen,
  onClose,
  onImageCaptured
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState({ current: 0, limit: 10, canCapture: true, isOverLimit: false });
  const { isPremium } = useSubscription();
  const { 
    capturePhotoWithLimitCheck,
    showPremiumModal,
    setShowPremiumModal,
    getNutritionUsageInfo
  } = useFoodCaptureWithLimits();

  // Función memoizada para cargar info de uso
  const loadUsageInfo = useCallback(async () => {
    if (isOpen && !isPremium) {
      const info = await getNutritionUsageInfo();
      setUsageInfo(info);
    }
  }, [isOpen, isPremium, getNutritionUsageInfo]);

  // Cargar info de uso cuando se abre el diálogo
  useEffect(() => {
    loadUsageInfo();
  }, [loadUsageInfo]);

  const handleCameraCapture = async () => {
    const canCapture = await capturePhotoWithLimitCheck();
    if (!canCapture) return;
    
    setIsLoading(true);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          onImageCaptured(imageUrl);
          onClose();
        }
        setIsLoading(false);
      };
      
      input.click();
    } catch (error) {
      console.error('Error capturing from camera:', error);
      setIsLoading(false);
    }
  };

  const handleGalleryCapture = async () => {
    const canCapture = await capturePhotoWithLimitCheck();
    if (!canCapture) return;
    
    setIsLoading(true);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          onImageCaptured(imageUrl);
          onClose();
        }
        setIsLoading(false);
      };
      
      input.click();
    } catch (error) {
      console.error('Error capturing from gallery:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-background border border-white/10 max-w-sm mx-auto rounded-xl">
          <DialogHeader className="flex flex-row items-center justify-between pb-2">
            <DialogTitle className="text-lg font-medium">
              Agregar Comida
            </DialogTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-secondary/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-4">
            <UsageLimitsBanner type="nutrition" />

            <div className="grid grid-cols-1 gap-4">
              <div 
                className="neu-card p-6 cursor-pointer hover:bg-secondary/10 transition-all duration-200 active:shadow-neu-button-active"
                onClick={handleCameraCapture}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Escaneo de comida</h3>
                  <p className="text-sm text-muted-foreground">
                    Tomar foto del alimento con la cámara
                  </p>
                </div>
              </div>

              <div 
                className="neu-card p-6 cursor-pointer hover:bg-secondary/10 transition-all duration-200 active:shadow-neu-button-active"
                onClick={handleGalleryCapture}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Image className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Galería</h3>
                  <p className="text-sm text-muted-foreground">
                    Seleccionar imagen existente del dispositivo
                  </p>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground mt-2">Procesando imagen...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="nutrition"
        currentUsage={usageInfo.current}
        limit={usageInfo.limit}
      />
    </>
  );
};
