
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExerciseSet {
  set_number: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

interface ExerciseDetail {
  id: number;
  name: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_between_sets_seconds: number;
  muscle_group_main?: string;
  equipment_required?: string;
}

interface Routine {
  id: number;
  name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  type?: string;
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

        // Fetch exercises for this routine with explicit column specification to avoid ambiguity
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select(`
            id,
            sets,
            reps_min,
            reps_max,
            rest_between_sets_seconds,
            exercise_id,
            exercise_order,
            exercises!routine_exercises_exercise_id_fkey(
              name,
              muscle_group_main,
              equipment_required
            )
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
            rest_between_sets_seconds: ex.rest_between_sets_seconds || 60,
            muscle_group_main: ex.exercises?.muscle_group_main,
            equipment_required: ex.exercises?.equipment_required
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
      toast({
        title: "¡Entrenamiento iniciado!",
        description: `Has comenzado la rutina ${routine.name}`,
        variant: "default"
      });
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
