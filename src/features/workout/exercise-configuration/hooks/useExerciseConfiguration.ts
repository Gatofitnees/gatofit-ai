
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ConfiguredExercise } from '../types';
import { RoutineFormData } from '@/features/workout/exercise-selection/types';

export const useExerciseConfiguration = (
  initialExercises: ConfiguredExercise[],
  routineFormData: RoutineFormData
) => {
  const [exercises, setExercises] = useState<ConfiguredExercise[]>(initialExercises);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, data: Partial<ConfiguredExercise>) => {
    setExercises(
      exercises.map((ex, i) => (i === index ? { ...ex, ...data } : ex))
    );
  };

  const saveRoutine = async () => {
    setIsSaving(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Debes iniciar sesión para guardar rutinas");
        return;
      }

      // Insert routine into the database
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: routineFormData.name,
          description: routineFormData.description,
          user_id: user.id,
          estimated_duration_minutes: calculateTotalDuration(),
          is_predefined: false
        })
        .select()
        .single();

      if (routineError) {
        throw routineError;
      }

      // Insert exercise details
      const routineExercises = exercises.map((ex, index) => ({
        routine_id: routineData.id,
        exercise_id: ex.id,
        exercise_order: index + 1,
        sets: ex.sets,
        reps_min: ex.is_time_based ? null : ex.reps_min,
        reps_max: ex.is_time_based ? null : ex.reps_max,
        duration_seconds: ex.is_time_based ? ex.duration_seconds : null,
        rest_between_sets_seconds: ex.rest_seconds,
        notes: ex.notes
      }));

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercises);

      if (exercisesError) {
        throw exercisesError;
      }

      toast.success("Rutina guardada con éxito");
      return true;
    } catch (error: any) {
      console.error('Error saving routine:', error);
      toast.error(`Error al guardar la rutina: ${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotalDuration = () => {
    // Estimate total duration based on sets, reps and rest times
    let totalSeconds = 0;
    
    exercises.forEach(ex => {
      // Average seconds per set (rough estimate)
      const secondsPerSet = ex.is_time_based 
        ? (ex.duration_seconds || 30) 
        : ((ex.reps_min + ex.reps_max) / 2) * 3; // 3 seconds per rep average
      
      // Total time for all sets including rest
      totalSeconds += (ex.sets * secondsPerSet) + ((ex.sets - 1) * ex.rest_seconds);
    });
    
    // Convert to minutes and round up
    return Math.ceil(totalSeconds / 60);
  };

  return {
    exercises,
    setExercises,
    updateExercise,
    handleRemoveExercise,
    isSaving,
    showConfirmDialog,
    setShowConfirmDialog,
    saveRoutine,
    calculateTotalDuration
  };
};
