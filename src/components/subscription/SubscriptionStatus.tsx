
import React from 'react';
import { Crown, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { UserSubscription } from '@/hooks/useSubscription';

interface SubscriptionStatusProps {
  subscription: UserSubscription | null;
  isPremium: boolean;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscription,
  isPremium
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
        return 'Gratuito';
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
          {/* Plan Info */}
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Plan:</span>
            <span className="font-medium">{getPlanName(subscription.plan_type)}</span>
          </div>
          
          {/* Expiration Date */}
          {subscription.expires_at && (
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Expira:
              </span>
              <span className="font-medium">{formatDate(subscription.expires_at)}</span>
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
          {subscription.status === 'active' && (
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
