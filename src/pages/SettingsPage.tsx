
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CreditCard, Bell, Globe, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const showComingSoon = (feature: string) => {
    toast({
      title: feature,
      description: "Función próximamente disponible",
    });
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="mr-3 p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Ajustes</h1>
      </div>

      {/* Profile Section */}
      <Card className="mb-4">
        <CardBody>
          <h3 className="font-semibold mb-3">Perfil</h3>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/profile')}
          >
            <User className="h-4 w-4 mr-3" />
            Editar perfil
          </Button>
        </CardBody>
      </Card>

      {/* Subscription Section */}
      <Card className="mb-4">
        <CardBody>
          <h3 className="font-semibold mb-3">Suscripción</h3>
          <div className="space-y-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">Plan Actual: Básico</p>
              <p className="text-xs text-muted-foreground">Acceso completo a todas las funciones</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => showComingSoon('Gestión de suscripción')}
            >
              <CreditCard className="h-4 w-4 mr-3" />
              Gestionar plan de pago
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Notifications Section */}
      <Card className="mb-4">
        <CardBody>
          <h3 className="font-semibold mb-3">Notificaciones</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => showComingSoon('Configuración de notificaciones')}
            >
              <Bell className="h-4 w-4 mr-3" />
              Recordatorios de comidas
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => showComingSoon('Configuración de notificaciones')}
            >
              <Bell className="h-4 w-4 mr-3" />
              Recordatorios de entrenamiento
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => showComingSoon('Configuración de notificaciones')}
            >
              <Bell className="h-4 w-4 mr-3" />
              Notificaciones sociales
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Preferences Section */}
      <Card className="mb-4">
        <CardBody>
          <h3 className="font-semibold mb-3">Preferencias</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => showComingSoon('Cambio de unidades')}
            >
              <Globe className="h-4 w-4 mr-3" />
              Unidades: Métrico (kg/cm)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => showComingSoon('Cambio de idioma')}
            >
              <Globe className="h-4 w-4 mr-3" />
              Idioma: Español
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Session Section */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-3">Sesión</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => showComingSoon('Cambio de cuenta')}
            >
              <RefreshCw className="h-4 w-4 mr-3" />
              Cambiar cuenta
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar sesión
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SettingsPage;
