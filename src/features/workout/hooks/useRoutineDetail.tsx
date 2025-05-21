
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExerciseDetail {
  id: number;
  name: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_between_sets_seconds: number;
}

interface Routine {
  id: number;
  name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
}

export const useRoutineDetail = (routineId: number | undefined) => {
  const { toast } = useToast();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingWorkout, setStartingWorkout] = useState(false);

  useEffect(() => {
    if (!routineId) {
      setLoading(false);
      return;
    }

    const fetchRoutineDetails = async () => {
      try {
        // Fetch routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', routineId)
          .single();

        if (routineError) {
          console.error("Error fetching routine:", routineError);
          throw routineError;
        }

        setRoutine(routineData);

        // Fetch exercises for this routine
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select(`
            id,
            sets,
            reps_min,
            reps_max,
            rest_between_sets_seconds,
            exercise_id,
            exercises(name)
          `)
          .eq('routine_id', routineId)
          .order('exercise_order', { ascending: true });

        if (exercisesError) {
          console.error("Error fetching exercises:", exercisesError);
          throw exercisesError;
        }

        if (exercisesData) {
          // Transform to expected format
          const formattedExercises = exercisesData.map(ex => ({
            id: ex.exercise_id,
            name: ex.exercises?.name || "Exercise name not found",
            sets: ex.sets || 0,
            reps_min: ex.reps_min || 0,
            reps_max: ex.reps_max || 0,
            rest_between_sets_seconds: ex.rest_between_sets_seconds || 60
          }));

          setExerciseDetails(formattedExercises);
        }
      } catch (error) {
        console.error("Error loading routine details:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar los detalles de la rutina",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoutineDetails();
  }, [routineId, toast]);

  const handleStartWorkout = async () => {
    if (!routine) return;
    
    setStartingWorkout(true);
    
    try {
      // Here you would implement code to start a workout session
      // For example, create a workout_logs entry
      
      toast({
        title: "¡Entrenamiento iniciado!",
        description: `Has comenzado la rutina ${routine.name}`,
        variant: "default"
      });
      
      // Navigate to workout tracking page or show workout interface
      // This would be implemented in the component using this hook
    } catch (error) {
      console.error("Error starting workout:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento",
        variant: "destructive"
      });
    } finally {
      setStartingWorkout(false);
    }
  };

  return {
    routine,
    exerciseDetails,
    loading,
    startingWorkout,
    handleStartWorkout
  };
};
