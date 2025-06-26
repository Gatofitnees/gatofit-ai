
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
    <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-4 shadow-neu-card">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {formatDate(date)}
        </h3>
        <div className="w-16 h-0.5 bg-primary/30 mx-auto rounded-full"></div>
      </div>
      
      {!hasActivities ? (
        <div className="text-center py-6 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Sin actividad registrada</p>
            <p className="text-xs text-muted-foreground/70">¡Agrega entrenamientos o registra tu alimentación!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Workouts Section */}
          {workouts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Entrenamientos</h4>
                  <p className="text-xs text-muted-foreground">{workouts.length} sesión{workouts.length > 1 ? 'es' : ''}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {workouts.map((workout, index) => (
                  <div key={index} className="bg-secondary/30 rounded-lg p-3 border border-green-500/20">
                    <h5 className="font-medium text-foreground text-sm mb-2">
                      {workout.routine_name_snapshot || 'Entrenamiento personalizado'}
                    </h5>
                    <div className="flex items-center gap-3 text-xs">
                      {workout.duration_completed_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {workout.duration_completed_minutes} min
                          </span>
                        </div>
                      )}
                      {workout.calories_burned_estimated && (
                        <span className="text-orange-600 font-medium">
                          {workout.calories_burned_estimated} kcal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Section */}
          {nutrition && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Utensils className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Nutrición</h4>
                  <p className="text-xs text-muted-foreground">{nutrition.meals_count} comida{nutrition.meals_count > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-3 border border-blue-500/20">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Calorías</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {Math.round(nutrition.total_calories)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Proteína</span>
                      <span className="text-xs font-medium text-foreground">
                        {Math.round(nutrition.total_protein)}g
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Carbohidratos</span>
                      <span className="text-xs font-medium text-foreground">
                        {Math.round(nutrition.total_carbs)}g
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Grasas</span>
                      <span className="text-xs font-medium text-foreground">
                        {Math.round(nutrition.total_fats)}g
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Experience Section */}
          {experience_gained > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Experiencia</h4>
                  <p className="text-xs text-muted-foreground">Puntos ganados</p>
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-3 border border-primary/20">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold text-primary">
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
