
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/Button';
import { Crown, Check, X, Sparkles, Star, Zap } from 'lucide-react';
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
      <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-yellow-500/30 max-w-sm mx-auto rounded-2xl p-0 overflow-hidden shadow-2xl animate-scale-in">
        {/* Animated background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-75"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-150"></div>
        </div>

        {/* Header with close button */}
        <DialogHeader className="relative flex flex-row items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center animate-[spin_3s_linear_infinite]">
              <Crown className="h-5 w-5 text-white animate-[spin_3s_linear_infinite_reverse]" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-20 animate-ping"></div>
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent animate-pulse">
              {featureInfo.title}
            </DialogTitle>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 border-none rounded-full transition-all duration-200 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="relative px-6 pb-6 space-y-6">
          {/* Description */}
          <p className="text-sm text-gray-300 text-center leading-relaxed">
            {featureInfo.description}
          </p>

          {/* Prominent Price Display */}
          {yearlyPlan && (
            <div className="relative bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl p-6 border border-yellow-500/40 overflow-hidden">
              {/* Animated background sparkles */}
              <div className="absolute inset-0">
                <Sparkles className="absolute top-2 left-3 h-3 w-3 text-yellow-400/60 animate-pulse" />
                <Star className="absolute top-4 right-4 h-2 w-2 text-orange-400/60 animate-pulse delay-75" />
                <Zap className="absolute bottom-3 left-2 h-2 w-2 text-yellow-400/60 animate-pulse delay-150" />
                <Sparkles className="absolute bottom-2 right-3 h-3 w-3 text-orange-400/60 animate-pulse delay-300" />
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-bounce">
                  <Star className="inline h-3 w-3 mr-1" />
                  AHORRA 61%
                </div>
              </div>

              <div className="relative text-center mt-2">
                <div className="mb-2">
                  <span className="text-sm text-gray-400 line-through">${yearlyPlan.price_usd}/año</span>
                </div>
                
                {/* Main price - prominently displayed */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent animate-pulse">
                    $2.50
                  </span>
                  <div className="text-lg text-gray-300 font-medium">
                    /mes
                  </div>
                </div>
                
                <p className="text-sm text-green-400 font-semibold animate-fade-in">
                  Solo pagando anualmente
                </p>
              </div>
            </div>
          )}

          {/* Animated Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm group hover:scale-105 transition-transform duration-200">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-blue-500/25">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-white">Rutinas ilimitadas</p>
                <p className="text-xs text-gray-400">Sin restricciones de creación</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-400" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm group hover:scale-105 transition-transform duration-200 delay-75">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-green-500/25">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-white">Análisis nutricional IA</p>
                <p className="text-xs text-gray-400">Escaneos ilimitados semanales</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-400" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm group hover:scale-105 transition-transform duration-200 delay-150">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-purple-500/25">
                <Star className="h-5 w-5 text-white fill-current" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-white">Chat IA ilimitado</p>
                <p className="text-xs text-gray-400">Asesoría personalizada 24/7</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-400" />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:from-yellow-400 hover:via-orange-400 hover:to-yellow-400 text-black font-bold text-lg py-4 rounded-xl shadow-2xl transform transition-all duration-200 hover:scale-105 hover:shadow-yellow-500/25 animate-pulse"
          >
            <Crown className="h-5 w-5 mr-2" />
            Desbloquear Premium
          </Button>

          <p className="text-xs text-gray-400 text-center animate-fade-in">
            Cancela en cualquier momento • Sin compromisos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
