
import React from 'react';
import { Crown, Calendar, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import { UserSubscription } from '@/hooks/useSubscription';

interface SubscriptionStatusProps {
  subscription: UserSubscription | null;
  isPremium: boolean;
  onCancelScheduledChange?: () => void;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscription,
  isPremium,
  onCancelScheduledChange
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Crown className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'expired':
        return 'Expirado';
      case 'cancelled':
        return 'Cancelado';
      case 'pending':
        return 'Pendiente';
      case 'trial':
        return 'Prueba';
      default:
        return status;
    }
  };

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'free':
        return 'Plan Gratuito';
      case 'monthly':
        return 'Premium Mensual';
      case 'yearly':
        return 'Premium Anual';
      default:
        return planType;
    }
  };

  return (
    <div className="neu-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Estado actual
        </h2>
        {isPremium && (
          <div className="bg-gradient-to-r from-primary to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Premium
          </div>
        )}
      </div>
      
      {subscription ? (
        <div className="space-y-4">
          {/* Current Plan Info */}
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Plan actual:</span>
            <span className="font-medium">{getPlanName(subscription.plan_type)}</span>
          </div>
          
          {/* Current Plan Expiration */}
          {subscription.expires_at && (
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {subscription.next_plan_type ? 'Válido hasta:' : 'Expira:'}
              </span>
              <span className="font-medium">{formatDate(subscription.expires_at)}</span>
            </div>
          )}

          {/* Scheduled Plan Change */}
          {subscription.next_plan_type && subscription.next_plan_starts_at && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <ArrowRight className="h-4 w-4" />
                <span className="font-semibold text-sm">Cambio Programado</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próximo plan:</span>
                  <span className="font-medium">{getPlanName(subscription.next_plan_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="font-medium">{formatDate(subscription.next_plan_starts_at)}</span>
                </div>
              </div>
              {onCancelScheduledChange && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onCancelScheduledChange}
                  className="w-full text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                >
                  Cancelar cambio programado
                </Button>
              )}
            </div>
          )}
          
          {/* Status */}
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Estado:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(subscription.status)}
              <span className="font-medium">{getStatusText(subscription.status)}</span>
            </div>
          </div>

          {/* Auto Renewal */}
          {subscription.status === 'active' && !subscription.next_plan_type && (
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Renovación automática:</span>
              <span className={`font-medium ${subscription.auto_renewal ? 'text-green-500' : 'text-yellow-500'}`}>
                {subscription.auto_renewal ? 'Activada' : 'Desactivada'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No tienes una suscripción activa</p>
          <p className="text-sm text-muted-foreground mt-1">
            Obtén Premium para desbloquear todas las funciones
          </p>
        </div>
      )}
    </div>
  );
};
