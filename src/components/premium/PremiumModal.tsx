
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/Button';
import { Crown, Check, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'routines' | 'nutrition' | 'ai_chat';
  currentUsage?: number;
  limit?: number;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  feature,
  currentUsage,
  limit
}) => {
  const { plans } = useSubscription();
  const navigate = useNavigate();

  const getFeatureMessage = () => {
    switch (feature) {
      case 'routines':
        return {
          title: 'Límite alcanzado',
          description: `Has creado ${currentUsage}/${limit} rutinas. Actualiza a Premium para crear rutinas ilimitadas.`
        };
      case 'nutrition':
        return {
          title: 'Límite alcanzado',
          description: `Has usado ${currentUsage}/${limit} fotos esta semana. Actualiza a Premium para fotos ilimitadas.`
        };
      case 'ai_chat':
        return {
          title: 'Límite alcanzado',
          description: `Has usado ${currentUsage}/${limit} chats esta semana. Actualiza a Premium para chats ilimitados.`
        };
      default:
        return {
          title: 'Desbloquea Premium',
          description: 'Accede a todas las funciones premium sin limitaciones.'
        };
    }
  };

  const featureInfo = getFeatureMessage();
  const yearlyPlan = plans.find(p => p.plan_type === 'yearly');

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border border-white/10 max-w-xs mx-auto rounded-xl p-4">
        <DialogHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Crown className="h-3 w-3 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {featureInfo.title}
            </DialogTitle>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-5 w-5 p-0 hover:bg-secondary/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {featureInfo.description}
          </p>

          {/* Características principales */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-2 w-2 text-green-500" />
              </div>
              <span className="text-xs">Funciones ilimitadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-2 w-2 text-green-500" />
              </div>
              <span className="text-xs">Sin anuncios</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-2 w-2 text-green-500" />
              </div>
              <span className="text-xs">Soporte premium</span>
            </div>
          </div>

          {/* Plan destacado */}
          {yearlyPlan && (
            <div className="neu-card p-3 border border-yellow-500/30 relative">
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  MEJOR VALOR
                </span>
              </div>
              <div className="text-center mt-2">
                <h4 className="font-bold text-sm">{yearlyPlan.name}</h4>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-bold">${yearlyPlan.price_usd}</span>
                  <span className="text-xs text-muted-foreground">/año</span>
                </div>
                <p className="text-xs text-green-500">Solo $2.50/mes</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-sm py-2"
          >
            Ver Planes
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Cancela en cualquier momento
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
