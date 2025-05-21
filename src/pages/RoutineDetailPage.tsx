
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoutineDetails {
  id: number;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
  is_predefined?: boolean;
}

interface ExerciseDetails {
  id: number;
  name: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_between_sets_seconds: number;
  exercise_order: number;
}

const RoutineDetailPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [routine, setRoutine] = useState<RoutineDetails | null>(null);
  const [exercises, setExercises] = useState<ExerciseDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingWorkout, setStartingWorkout] = useState(false);
  
  useEffect(() => {
    const fetchRoutineDetails = async () => {
      if (!routineId) return;
      
      setLoading(true);
      try {
        // Fetch routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', parseInt(routineId))
          .single();
        
        if (routineError) {
          throw routineError;
        }
        
        // Fetch exercises for this routine
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select(`
            id,
            sets,
            reps_min,
            reps_max,
            rest_between_sets_seconds,
            exercise_order,
            exercises (
              id,
              name
            )
          `)
          .eq('routine_id', parseInt(routineId))
          .order('exercise_order', { ascending: true });
        
        if (exercisesError) {
          throw exercisesError;
        }
        
        setRoutine(routineData);
        
        // Transform exercise data
        const formattedExercises = exercisesData.map((item) => ({
          id: item.exercises?.id,
          name: item.exercises?.name,
          sets: item.sets,
          reps_min: item.reps_min,
          reps_max: item.reps_max,
          rest_between_sets_seconds: item.rest_between_sets_seconds,
          exercise_order: item.exercise_order
        }));
        
        setExercises(formattedExercises);
      } catch (error) {
        console.error("Error fetching routine details:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutineDetails();
  }, [routineId, toast]);
  
  const handleBack = () => {
    navigate("/workout");
  };
  
  const handleStartWorkout = () => {
    setStartingWorkout(true);
    
    // Simulating starting a workout
    setTimeout(() => {
      toast({
        title: "¡Rutina iniciada!",
        description: "Tu entrenamiento ha comenzado"
      });
      navigate("/workout");
    }, 1500);
  };
  
  const getRoutineTypeLabel = (type: string | undefined) => {
    if (!type) return "-";
    
    const types: Record<string, string> = {
      strength: "Fuerza",
      cardio: "Cardio",
      flexibility: "Flexibilidad",
      mixed: "Mixto",
      custom: "Personalizado"
    };
    
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-xl shadow-neu-button p-4 mb-6 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
          <div className="h-10 w-full bg-gray-200 rounded mt-4"></div>
        </div>
        
        <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!routine) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Rutina no encontrada</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-neu-button p-4 mb-6 text-center">
          <p className="mb-4">La rutina que buscas no existe o no tienes acceso.</p>
          <Button onClick={handleBack}>Volver a mis rutinas</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={handleBack}
          className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{routine.name}</h1>
      </div>
      
      {/* Routine Info Card */}
      <div className="bg-white rounded-xl shadow-neu-button p-4 mb-6">
        <div className="flex flex-wrap gap-3 text-sm mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center">
            <Dumbbell className="h-3.5 w-3.5 mr-1" />
            {getRoutineTypeLabel(routine.type)}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {routine.estimated_duration_minutes || exercises.length * 5} min
          </span>
        </div>
        
        {routine.description && (
          <p className="text-sm text-muted-foreground mb-4">{routine.description}</p>
        )}
        
        <Button 
          variant="default" 
          className="w-full bg-blue-500 hover:bg-blue-600 py-6"
          onClick={handleStartWorkout}
          disabled={startingWorkout}
        >
          {startingWorkout ? 'Iniciando...' : 'Iniciar Rutina'}
        </Button>
      </div>
      
      {/* Exercises */}
      <h2 className="font-semibold mb-3">Ejercicios ({exercises.length})</h2>
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{exercise.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {exercise.sets} series • {exercise.reps_min}-{exercise.reps_max} reps • {exercise.rest_between_sets_seconds}s descanso
                </p>
              </div>
              <span className="bg-gray-100 text-gray-500 h-6 w-6 flex items-center justify-center rounded-full text-xs font-medium">
                {index + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutineDetailPage;
