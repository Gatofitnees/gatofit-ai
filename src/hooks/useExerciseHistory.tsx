
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
            workout_log:workout_logs(workout_date, user_id)
          `)
          .eq('exercise_id', exerciseId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform data to match our ExerciseHistory interface
          const formattedHistory: ExerciseHistory[] = data.map((entry) => {
            // Handle the nested workout_log data safely
            const workoutLog = entry.workout_log;
            let workoutDate = new Date().toISOString();
            let userId = '';
            
            // Check if workout_log exists and extract date and user_id
            if (workoutLog && typeof workoutLog === 'object' && workoutLog !== null) {
              // If it's an array, take the first item
              if (Array.isArray(workoutLog)) {
                if (workoutLog.length > 0) {
                  const firstLog = workoutLog[0];
                  if (firstLog) {
                    workoutDate = firstLog.workout_date || workoutDate;
                    userId = firstLog.user_id || userId;
                  }
                }
              } else {
                // If it's a single object, safely access its properties
                const singleLog = workoutLog as any;
                workoutDate = singleLog?.workout_date || workoutDate;
                userId = singleLog?.user_id || userId;
              }
            }
              
            return {
              id: entry.id,
              exercise_id: entry.exercise_id,
              date: workoutDate,
              weight_kg: entry.weight_kg_used || 0,
              reps: entry.reps_completed || 0,
              sets: entry.set_number || 1,
              user_id: userId,
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
