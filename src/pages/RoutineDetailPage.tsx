import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, Clock, Plus, Check } from "lucide-react";
import Button from "@/components/Button";
import { supabase } from "@/integrations/supabase/client";

interface Exercise {
  exercise_id: number;
  exercise_order: number;
  reps_min: number;
  reps_max: number;
  rest_between_sets_seconds: number;
  set_number: number;
  exercise_name_snapshot?: string;
  sets?: Array<{
    set_number: number;
    reps_min: number;
    reps_max: number;
    rest_between_sets_seconds: number;
  }>;
}

interface Routine {
  id: number;
  name: string;
  description?: string;
  type?: string;
  estimated_duration_minutes?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  exercises: Exercise[];
}

interface ExerciseDetail {
  id: number;
  name: string;
  muscle_group_main?: string;
  equipment_required?: string;
  sets: Array<{
    set_number: number;
    reps_min: number;
    reps_max: number;
    rest_seconds: number;
  }>;
}

const RoutineDetailPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingWorkout, setStartingWorkout] = useState(false);

  useEffect(() => {
    const fetchRoutineDetails = async () => {
      if (!routineId) return;
      
      setLoading(true);
      
      try {
        // Fetch the routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', parseInt(routineId))
          .single();
          
        if (routineError) throw routineError;
        
        // Fetch the routine exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select('*')
          .eq('routine_id', parseInt(routineId))
          .order('exercise_order', { ascending: true })
          .order('set_number', { ascending: true });
          
        if (exercisesError) throw exercisesError;
        
        // Process exercise data
        const groupedExercises: Record<number, Exercise> = {};
        exercisesData.forEach((exercise: any) => {
          if (!groupedExercises[exercise.exercise_id]) {
            groupedExercises[exercise.exercise_id] = {
              ...exercise,
              sets: []
            };
          }
          
          groupedExercises[exercise.exercise_id].sets?.push({
            set_number: exercise.set_number,
            reps_min: exercise.reps_min,
            reps_max: exercise.reps_max,
            rest_between_sets_seconds: exercise.rest_between_sets_seconds
          });
        });
        
        // Convert object to array and sort by exercise_order
        const exercisesArray = Object.values(groupedExercises).sort(
          (a, b) => a.exercise_order - b.exercise_order
        );
        
        setRoutine({
          ...routineData,
          exercises: exercisesArray
        });
        
        // Fetch exercise details
        const exerciseIds = exercisesArray.map(ex => ex.exercise_id);
        
        if (exerciseIds.length > 0) {
          const { data: exerciseDetailsData, error: detailsError } = await supabase
            .from('exercises')
            .select('*')
            .in('id', exerciseIds);
            
          if (detailsError) throw detailsError;
          
          // Map exercise details with sets - fixed to match ExerciseDetail interface
          const detailsWithSets: ExerciseDetail[] = exerciseIds.map(id => {
            const exerciseDetail = exerciseDetailsData.find((d: any) => d.id === id);
            const exerciseSets = groupedExercises[id].sets || [];
            
            return {
              id,
              name: exerciseDetail?.name || 'Unknown Exercise',
              muscle_group_main: exerciseDetail?.muscle_group_main,
              equipment_required: exerciseDetail?.equipment_required,
              sets: exerciseSets.map(set => ({
                set_number: set.set_number,
                reps_min: set.reps_min,
                reps_max: set.reps_max,
                rest_seconds: set.rest_between_sets_seconds
              }))
            };
          });
          
          setExerciseDetails(detailsWithSets);
        }
      } catch (error) {
        console.error("Error fetching routine details:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la rutina",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutineDetails();
  }, [routineId, toast]);
  
  const handleStartWorkout = () => {
    setStartingWorkout(true);
    
    // In a real implementation, this would navigate to a workout session page
    setTimeout(() => {
      toast({
        title: "¡Rutina iniciada!",
        description: "Tu entrenamiento ha comenzado"
      });
      
      // This should navigate to a workout execution page in a real implementation
      // For now, we'll just set the state back
      setStartingWorkout(false);
    }, 1000);
  };
  
  const handleBack = () => {
    navigate("/workout");
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
          <h1 className="text-xl font-bold">Cargando rutina...</h1>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-secondary/30 rounded-xl"></div>
          <div className="h-40 bg-secondary/20 rounded-xl"></div>
          <div className="h-40 bg-secondary/20 rounded-xl"></div>
          <div className="h-40 bg-secondary/20 rounded-xl"></div>
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
        
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-6">La rutina que estás buscando no existe o ha sido eliminada.</p>
          <Button 
            variant="primary" 
            onClick={handleBack}
            type="button"
          >
            Volver a mis rutinas
          </Button>
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
      
      {/* Routine Info */}
      <div className="bg-secondary/10 p-4 rounded-xl mb-6">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Clock className="h-4 w-4 mr-1" />
          <span>Duración estimada: {routine.estimated_duration_minutes || '30'} min</span>
        </div>
        
        {routine.description && (
          <p className="text-sm">{routine.description}</p>
        )}
        
        <div className="mt-4">
          <Button
            variant="primary"
            leftIcon={<Play className="h-4 w-4" />}
            fullWidth
            onClick={handleStartWorkout}
            disabled={startingWorkout}
            type="button"
          >
            {startingWorkout ? 'Iniciando...' : 'Iniciar Entrenamiento'}
          </Button>
        </div>
      </div>
      
      {/* Exercises List */}
      <h2 className="font-semibold mb-4">Ejercicios</h2>
      <div className="space-y-4">
        {exerciseDetails.map((exercise, index) => (
          <div key={exercise.id} className="bg-white shadow-neu-button rounded-xl overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {exercise.muscle_group_main}
                    {exercise.equipment_required && ` • ${exercise.equipment_required}`}
                  </p>
                </div>
                <span className="bg-secondary/20 text-xs px-2 py-1 rounded-full">
                  {exercise.sets.length} {exercise.sets.length === 1 ? 'serie' : 'series'}
                </span>
              </div>
              
              {/* Sets */}
              <div className="mt-3 space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex justify-between items-center text-sm p-2 bg-secondary/10 rounded-lg">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Serie {set.set_number}</span>
                      <span>{set.reps_min}-{set.reps_max} reps</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {set.rest_seconds}s descanso
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {exerciseDetails.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Esta rutina no tiene ejercicios</p>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate(`/workout/create`)}
            type="button"
          >
            Crear nueva rutina
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoutineDetailPage;
