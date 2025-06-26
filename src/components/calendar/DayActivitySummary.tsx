
import React from 'react';
import { Clock, Utensils, Dumbbell, Star, Trophy, TrendingUp } from 'lucide-react';

interface WorkoutSummary {
  id: number;
  routine_name_snapshot: string | null;
  duration_completed_minutes: number | null;
  calories_burned_estimated: number | null;
}

interface NutritionSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals_count: number;
}

interface DayActivitySummaryProps {
  date: string;
  workouts: WorkoutSummary[];
  nutrition: NutritionSummary | null;
  experience_gained: number;
}

const DayActivitySummary: React.FC<DayActivitySummaryProps> = ({
  date,
  workouts,
  nutrition,
  experience_gained
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const hasActivities = workouts.length > 0 || nutrition || experience_gained > 0;

  return (
    <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border/50 p-6 space-y-6 shadow-neu-card backdrop-blur-sm animate-fade-in">
      {/* Enhanced Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {formatDate(date)}
        </h3>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
      </div>
      
      {!hasActivities ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center shadow-neu-card">
            <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Sin actividad registrada</p>
            <p className="text-xs text-muted-foreground/70">¡Agrega entrenamientos o registra tu alimentación!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Workouts Section */}
          {workouts.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-neu-card">
                  <Dumbbell className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Entrenamientos</h4>
                  <p className="text-xs text-muted-foreground">{workouts.length} sesión{workouts.length > 1 ? 'es' : ''} completada{workouts.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {workouts.map((workout, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20 shadow-neu-card hover:scale-[1.02] transition-all duration-300">
                    <h5 className="font-medium text-foreground mb-2">
                      {workout.routine_name_snapshot || 'Entrenamiento personalizado'}
                    </h5>
                    <div className="flex items-center gap-4 text-sm">
                      {workout.duration_completed_minutes && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-background/50">
                          <Clock className="h-3 w-3 text-green-600" />
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            {workout.duration_completed_minutes} min
                          </span>
                        </div>
                      )}
                      {workout.calories_burned_estimated && (
                        <div className="px-3 py-1 rounded-lg bg-background/50">
                          <span className="text-orange-700 dark:text-orange-400 font-medium">
                            {workout.calories_burned_estimated} kcal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Nutrition Section */}
          {nutrition ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shadow-neu-card">
                  <Utensils className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Nutrición</h4>
                  <p className="text-xs text-muted-foreground">{nutrition.meals_count} comida{nutrition.meals_count > 1 ? 's' : ''} registrada{nutrition.meals_count > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20 shadow-neu-card hover:scale-[1.02] transition-all duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Calorías</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {Math.round(nutrition.total_calories)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Proteína</span>
                      <span className="text-sm font-semibold text-foreground">
                        {Math.round(nutrition.total_protein)}g
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Carbohidratos</span>
                      <span className="text-sm font-semibold text-foreground">
                        {Math.round(nutrition.total_carbs)}g
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Grasas</span>
                      <span className="text-sm font-semibold text-foreground">
                        {Math.round(nutrition.total_fats)}g
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Experience Section */}
          {experience_gained > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center shadow-neu-card">
                  <Star className="h-5 w-5 text-yellow-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Experiencia</h4>
                  <p className="text-xs text-muted-foreground">Puntos ganados por tu progreso</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20 shadow-neu-card hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    +{experience_gained} XP
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DayActivitySummary;
