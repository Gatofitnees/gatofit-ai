
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ExerciseSession {
  date: string;
  sets: {
    set_number: number;
    weight_kg_used: number | null;
    reps_completed: number | null;
  }[];
  maxWeight: number | null;
  totalReps: number;
}

interface ExerciseStats {
  maxWeight: number | null;
  maxReps: number | null;
  sessions: ExerciseSession[];
  progressData: { date: string; maxWeight: number }[];
}

interface UseExerciseHistoryProps {
  exerciseId?: number;
}

export const useExerciseHistory = ({ exerciseId }: UseExerciseHistoryProps) => {
  const [stats, setStats] = useState<ExerciseStats>({
    maxWeight: null,
    maxReps: null,
    sessions: [],
    progressData: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!exerciseId) return;
    
    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('workout_log_exercise_details')
          .select(`
            id,
            exercise_id,
            weight_kg_used,
            reps_completed,
            set_number,
            workout_log_id,
            workout_log:workout_logs!workout_log_exercise_details_workout_log_id_fkey(workout_date, user_id)
          `)
          .eq('exercise_id', exerciseId)
          .order('workout_log_id', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Group by workout date - Fix: Create proper date groups
          const sessionMap = new Map<string, ExerciseSession>();
          let globalMaxWeight = 0;
          let globalMaxReps = 0;
          
          data.forEach((entry) => {
            const workoutLog = Array.isArray(entry.workout_log) 
              ? entry.workout_log[0] 
              : entry.workout_log;
            
            if (!workoutLog?.workout_date) return;
            
            // Fix: Use ISO date format for proper grouping
            const dateKey = new Date(workoutLog.workout_date).toISOString().substring(0, 10);
            const displayDate = new Date(workoutLog.workout_date).toLocaleDateString('es-ES');
            
            if (!sessionMap.has(dateKey)) {
              sessionMap.set(dateKey, {
                date: displayDate,
                sets: [],
                maxWeight: null,
                totalReps: 0
              });
            }
            
            const session = sessionMap.get(dateKey)!;
            
            const weight = entry.weight_kg_used || 0;
            const reps = entry.reps_completed || 0;
            
            // Add set to this specific date's session
            session.sets.push({
              set_number: entry.set_number,
              weight_kg_used: entry.weight_kg_used,
              reps_completed: entry.reps_completed
            });
            
            // Update session stats for this specific date
            if (weight > (session.maxWeight || 0)) {
              session.maxWeight = weight;
            }
            session.totalReps += reps;
            
            // Update global stats
            if (weight > globalMaxWeight) globalMaxWeight = weight;
            if (reps > globalMaxReps) globalMaxReps = reps;
          });
          
          // Sort sets within each session by set_number
          sessionMap.forEach(session => {
            session.sets.sort((a, b) => a.set_number - b.set_number);
          });
          
          // Fix: Sort sessions chronologically (most recent first for the array)
          const sessions = Array.from(sessionMap.values())
            .sort((a, b) => {
              const dateA = new Date(a.date.split('/').reverse().join('-'));
              const dateB = new Date(b.date.split('/').reverse().join('-'));
              return dateB.getTime() - dateA.getTime();
            });
          
          // Create progress data for chart (chronological order)
          const progressData = sessions
            .filter(session => session.maxWeight && session.maxWeight > 0)
            .reverse() // Chronological order for chart
            .map(session => ({
              date: session.date,
              maxWeight: session.maxWeight!
            }));
          
          setStats({
            maxWeight: globalMaxWeight || null,
            maxReps: globalMaxReps || null,
            sessions,
            progressData
          });
        } else {
          setStats({
            maxWeight: null,
            maxReps: null,
            sessions: [],
            progressData: []
          });
        }
      } catch (error) {
        console.error('Error fetching exercise history:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el historial del ejercicio",
          variant: "destructive"
        });
        setStats({
          maxWeight: null,
          maxReps: null,
          sessions: [],
          progressData: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [exerciseId, toast]);
  
  return {
    stats,
    loading,
    isEmpty: stats.sessions.length === 0
  };
};
