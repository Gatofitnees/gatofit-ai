
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/Button';
import { Crown, Check, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

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
  const { plans, upgradeSubscription } = useSubscription();

  const getFeatureMessage = () => {
    switch (feature) {
      case 'routines':
        return {
          title: 'Limite de rutinas alcanzado',
          description: `Has creado ${currentUsage}/${limit} rutinas. Actualiza a Premium para crear rutinas ilimitadas.`,
          benefit: 'Rutinas ilimitadas'
        };
      case 'nutrition':
        return {
          title: 'Límite de fotos nutricionales',
          description: `Has usado ${currentUsage}/${limit} fotos esta semana. Actualiza a Premium para fotos ilimitadas.`,
          benefit: 'Análisis nutricional ilimitado'
        };
      case 'ai_chat':
        return {
          title: 'Límite de mensajes IA',
          description: `Has usado ${currentUsage}/${limit} mensajes esta semana. Actualiza a Premium para mensajes ilimitados.`,
          benefit: 'Chat IA ilimitado'
        };
      default:
        return {
          title: 'Desbloquea todo el potencial',
          description: 'Accede a todas las funciones premium sin limitaciones.',
          benefit: 'Todas las funciones premium'
        };
    }
  };

  const featureInfo = getFeatureMessage();
  const monthlyPlan = plans.find(p => p.plan_type === 'monthly');
  const yearlyPlan = plans.find(p => p.plan_type === 'yearly');

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    // This would integrate with Play Store/App Store billing
    // For now, we'll simulate the upgrade
    const success = await upgradeSubscription(planType);
    if (success) {
      onClose();
    }
  };

  const premiumFeatures = [
    'Rutinas ilimitadas',
    'Análisis nutricional ilimitado',
    'Chat IA ilimitado',
    'Acceso prioritario a nuevas funciones',
    'Soporte premium',
    'Sin anuncios'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border border-white/10 max-w-md mx-auto rounded-xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {featureInfo.title}
            </DialogTitle>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-secondary/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground text-center">
            {featureInfo.description}
          </p>

          {/* Premium Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-center">Con Premium obtienes:</h3>
            <div className="space-y-2">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="space-y-3">
            {yearlyPlan && (
              <div className="neu-card p-4 border-2 border-yellow-500/30 relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    MEJOR VALOR
                  </span>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-lg">{yearlyPlan.name}</h4>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-2xl font-bold">${yearlyPlan.price_usd}</span>
                    <span className="text-sm text-muted-foreground">/año</span>
                  </div>
                  <p className="text-xs text-green-500 mt-1">Equivale a $2.50/mes</p>
                  <Button
                    onClick={() => handleUpgrade('yearly')}
                    className="w-full mt-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                  >
                    Obtener Premium Anual
                  </Button>
                </div>
              </div>
            )}

            {monthlyPlan && (
              <div className="neu-card p-4">
                <div className="text-center">
                  <h4 className="font-bold">{monthlyPlan.name}</h4>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xl font-bold">${monthlyPlan.price_usd}</span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleUpgrade('monthly')}
                    className="w-full mt-3"
                  >
                    Obtener Premium Mensual
                  </Button>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Los pagos se procesan de forma segura a través de la tienda de aplicaciones.
            Cancela en cualquier momento.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
