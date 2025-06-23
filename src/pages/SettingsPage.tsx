
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Globe, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para las configuraciones
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [nutritionReminders, setNutritionReminders] = useState(true);
  const [weeklyProgress, setWeeklyProgress] = useState(false);
  const [isMetric, setIsMetric] = useState(true);

  const handleDeleteAccount = () => {
    // Implementar lógica de eliminación de cuenta
    console.log('Delete account requested');
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-bold">Configuración</h1>
        
        <div className="w-10"></div>
      </div>

      <div className="space-y-6">
        {/* Notificaciones */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </h2>
          
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="workout-reminders">Recordatorios de entrenamiento</Label>
                <p className="text-sm text-muted-foreground">
                  Te recordaremos cuando sea hora de entrenar
                </p>
              </div>
              <Switch
                id="workout-reminders"
                checked={workoutReminders}
                onCheckedChange={setWorkoutReminders}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="nutrition-reminders">Recordatorios de comida</Label>
                <p className="text-sm text-muted-foreground">
                  Te recordaremos registrar tus comidas
                </p>
              </div>
              <Switch
                id="nutrition-reminders"
                checked={nutritionReminders}
                onCheckedChange={setNutritionReminders}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-progress">Progreso semanal</Label>
                <p className="text-sm text-muted-foreground">
                  Resumen de tu progreso cada semana
                </p>
              </div>
              <Switch
                id="weekly-progress"
                checked={weeklyProgress}
                onCheckedChange={setWeeklyProgress}
              />
            </div>
          </div>
        </div>

        {/* Preferencias */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Preferencias
          </h2>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="unit-system">Sistema de unidades</Label>
                <p className="text-sm text-muted-foreground">
                  {isMetric ? 'Métrico (kg, cm)' : 'Imperial (lb, ft)'}
                </p>
              </div>
              <Switch
                id="unit-system"
                checked={isMetric}
                onCheckedChange={setIsMetric}
              />
            </div>
          </div>
        </div>

        {/* Zona de peligro */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-destructive">
            Zona de peligro
          </h2>
          
          <div className="bg-card rounded-lg border p-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar cuenta
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
