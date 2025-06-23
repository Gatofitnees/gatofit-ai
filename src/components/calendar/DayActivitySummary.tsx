
import React from 'react';
import { Clock, Utensils, Dumbbell, Star } from 'lucide-react';

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

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4">{formatDate(date)}</h3>
      
      {/* Workouts Section */}
      {workouts.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Dumbbell className="h-4 w-4" />
            <span>Entrenamientos ({workouts.length})</span>
          </div>
          {workouts.map((workout, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-medium">{workout.routine_name_snapshot || 'Entrenamiento personalizado'}</h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                {workout.duration_completed_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{workout.duration_completed_minutes} min</span>
                  </div>
                )}
                {workout.calories_burned_estimated && (
                  <span>{workout.calories_burned_estimated} kcal</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay entrenamientos registrados</p>
        </div>
      )}

      {/* Nutrition Section */}
      {nutrition ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Utensils className="h-4 w-4" />
            <span>Nutrición ({nutrition.meals_count} comidas)</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Calorías:</span>
                <span className="ml-1">{Math.round(nutrition.total_calories)}</span>
              </div>
              <div>
                <span className="font-medium">Proteína:</span>
                <span className="ml-1">{Math.round(nutrition.total_protein)}g</span>
              </div>
              <div>
                <span className="font-medium">Carbohidratos:</span>
                <span className="ml-1">{Math.round(nutrition.total_carbs)}g</span>
              </div>
              <div>
                <span className="font-medium">Grasas:</span>
                <span className="ml-1">{Math.round(nutrition.total_fats)}g</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay registros nutricionales</p>
        </div>
      )}

      {/* Experience Section */}
      {experience_gained > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>Experiencia ganada</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <span className="text-lg font-semibold text-primary">+{experience_gained} XP</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayActivitySummary;
