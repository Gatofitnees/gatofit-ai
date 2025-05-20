
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ExerciseHistory } from "@/data/exercises/exerciseTypes";

interface UseExerciseHistoryProps {
  exerciseId?: number;
}

export const useExerciseHistory = ({ exerciseId }: UseExerciseHistoryProps) => {
  const [history, setHistory] = useState<ExerciseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!exerciseId) return;
    
    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        // First check if there's a workout_log_exercise_details entry for this exercise
        const { data, error } = await supabase
          .from('workout_log_exercise_details')
          .select(`
            id,
            exercise_id,
            weight_kg_used,
            reps_completed,
            set_number,
            workout_log_id,
            workout_log:workout_logs(
              workout_date,
              user_id
            )
          `)
          .eq('exercise_id', exerciseId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform data to match our ExerciseHistory interface
          const formattedHistory: ExerciseHistory[] = data.map((entry) => {
            const workoutLog = entry.workout_log && Array.isArray(entry.workout_log) && entry.workout_log.length > 0 
              ? entry.workout_log[0] 
              : null;
              
            return {
              id: entry.id,
              exercise_id: entry.exercise_id,
              date: workoutLog?.workout_date || new Date().toISOString(),
              weight_kg: entry.weight_kg_used || 0,
              reps: entry.reps_completed || 0,
              sets: entry.set_number || 1,
              user_id: workoutLog?.user_id || '',
            };
          });
          
          // Sort by date (newest first)
          formattedHistory.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          
          setHistory(formattedHistory);
        } else {
          // No history found
          setHistory([]);
        }
      } catch (error) {
        console.error('Error fetching exercise history:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el historial del ejercicio",
          variant: "destructive"
        });
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [exerciseId, toast]);
  
  return {
    history,
    loading,
    isEmpty: history.length === 0
  };
};
