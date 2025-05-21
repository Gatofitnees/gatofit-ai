
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
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

export const useRoutineDetail = (routineId: string | undefined) => {
  const { toast } = useToast();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingWorkout, setStartingWorkout] = useState(false);

  const fetchRoutineDetails = useCallback(async () => {
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
        
        // Map exercise details with sets
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
      setStartingWorkout(false);
    }, 1000);
  };

  useEffect(() => {
    fetchRoutineDetails();
  }, [fetchRoutineDetails]);

  return {
    routine,
    exerciseDetails,
    loading,
    startingWorkout,
    handleStartWorkout
  };
};
