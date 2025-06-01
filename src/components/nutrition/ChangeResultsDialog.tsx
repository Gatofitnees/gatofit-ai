
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/Button';
import { X, Sparkles, Send } from 'lucide-react';

interface FoodData {
  custom_food_name: string;
  quantity_consumed: number;
  unit_consumed: string;
  calories_consumed: number;
  protein_g_consumed: number;
  carbs_g_consumed: number;
  fat_g_consumed: number;
  healthScore?: number;
  ingredients?: Array<{
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

interface ChangeResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: string) => void;
  foodData?: FoodData;
}

export const ChangeResultsDialog: React.FC<ChangeResultsDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  foodData
}) => {
  const [request, setRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (request.trim() && foodData) {
      setIsLoading(true);
      
      try {
        // Preparar la carga útil con toda la información de la comida
        const payload = {
          userRequest: request.trim(),
          foodData: {
            name: foodData.custom_food_name,
            quantity: foodData.quantity_consumed,
            unit: foodData.unit_consumed,
            calories: foodData.calories_consumed,
            protein: foodData.protein_g_consumed,
            carbs: foodData.carbs_g_consumed,
            fat: foodData.fat_g_consumed,
            healthScore: foodData.healthScore || 7,
            ingredients: foodData.ingredients || []
          },
          timestamp: new Date().toISOString()
        };

        console.log('Enviando datos al webhook:', payload);

        // Enviar al webhook
        const response = await fetch('https://gaton8n.gatofit.com/webhook-test/4a08cf38-9d1c-43a4-a5cc-6e554a0b6f71', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log('Datos enviados exitosamente al webhook');
          onSubmit(request.trim());
          setRequest('');
          onClose();
        } else {
          console.error('Error en la respuesta del webhook:', response.status);
          // Aún así llamamos onSubmit para mantener la funcionalidad existente
          onSubmit(request.trim());
          setRequest('');
          onClose();
        }
      } catch (error) {
        console.error('Error enviando al webhook:', error);
        // Aún así llamamos onSubmit para mantener la funcionalidad existente
        onSubmit(request.trim());
        setRequest('');
        onClose();
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border border-white/10 max-w-md mx-auto rounded-xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Cambiar resultados con IA
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
          <div>
            <label className="text-sm font-medium mb-2 block">
              ¿Qué te gustaría cambiar?
            </label>
            <Textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="Ej: Este no es un sandwich, es una ensalada..."
              className="min-h-[100px] resize-none"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!request.trim() || isLoading}
              leftIcon={isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
