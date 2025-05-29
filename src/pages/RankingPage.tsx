
import React, { useEffect } from 'react';
import { Flame, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { useStreaks } from '@/hooks/useStreaks';

const RankingPage: React.FC = () => {
  const { streakData, isLoading, updateStreak } = useStreaks();

  useEffect(() => {
    // Update streak when component mounts
    updateStreak();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin actividad';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Ranking</h1>
      
      {/* Main Streak Card */}
      <Card className="mb-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/20">
        <CardBody>
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <Flame className="h-12 w-12 text-orange-500 mr-2" />
              <span className="text-5xl font-bold text-orange-500">
                {isLoading ? '...' : streakData?.current_streak || 0}
              </span>
            </div>
            <h2 className="text-lg font-semibold mb-2">Racha Actual</h2>
            <p className="text-sm text-muted-foreground">
              Días consecutivos con actividad
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Points */}
        <Card>
          <CardBody>
            <div className="text-center py-4">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-500">
                {isLoading ? '...' : streakData?.total_points || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Puntos Totales
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Last Activity */}
        <Card>
          <CardBody>
            <div className="text-center py-4">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-500">
                {formatDate(streakData?.last_activity_date || null)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Última Actividad
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* How it Works */}
      <Card className="mb-6">
        <CardHeader 
          title="¿Cómo funciona?" 
          subtitle="Sistema de puntuación"
        />
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-500 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Registra una comida</p>
                <p className="text-xs text-muted-foreground">
                  Obtén 1 punto por registrar al menos una comida al día
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-500 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Completa un entrenamiento</p>
                <p className="text-xs text-muted-foreground">
                  Obtén 1 punto por completar un entrenamiento
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-500 text-sm font-bold">⚠</span>
              </div>
              <div>
                <p className="text-sm font-medium">Mantén la consistencia</p>
                <p className="text-xs text-muted-foreground">
                  Si pierdes un día sin actividad, tu racha se reinicia
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200/20">
        <CardBody>
          <div className="text-center py-4">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-500 mb-1">
              ¡Sigue así!
            </h3>
            <p className="text-sm text-muted-foreground">
              La consistencia es la clave del éxito. Cada día cuenta para alcanzar tus objetivos.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default RankingPage;
