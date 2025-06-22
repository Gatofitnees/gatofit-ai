
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
          let globalMaxWeight = 0;
          let globalMaxReps = 0;
          
          // Create a map to group sets by date (not by workout_log_id)
          const dateSessionsMap = new Map<string, {
            date: string;
            sets: Array<{
              set_number: number;
              weight_kg_used: number | null;
              reps_completed: number | null;
            }>;
          }>();
          
          // Process each entry to build date-based sessions
          data.forEach((entry) => {
            const workoutLog = Array.isArray(entry.workout_log) 
              ? entry.workout_log[0] 
              : entry.workout_log;
            
            if (!workoutLog?.workout_date) return;
            
            const displayDate = new Date(workoutLog.workout_date).toLocaleDateString('es-ES');
            
            // Initialize date session if it doesn't exist
            if (!dateSessionsMap.has(displayDate)) {
              dateSessionsMap.set(displayDate, {
                date: displayDate,
                sets: []
              });
            }
            
            const dateSession = dateSessionsMap.get(displayDate)!;
            const weight = entry.weight_kg_used || 0;
            const reps = entry.reps_completed || 0;
            
            // Add this set to the date session (no duplicate checking needed since we're grouping by date)
            dateSession.sets.push({
              set_number: entry.set_number,
              weight_kg_used: entry.weight_kg_used,
              reps_completed: entry.reps_completed
            });
            
            // Update global stats
            if (weight > globalMaxWeight) globalMaxWeight = weight;
            if (reps > globalMaxReps) globalMaxReps = reps;
          });
          
          // Convert date sessions map to ExerciseSession array
          const dateSessions: ExerciseSession[] = [];
          
          dateSessionsMap.forEach((dateSession) => {
            // Sort sets by set number for consistent display
            const sortedSets = dateSession.sets.sort((a, b) => a.set_number - b.set_number);
            
            // Calculate stats for this specific date (all workouts on this date combined)
            let maxWeight = 0;
            let totalReps = 0;
            
            sortedSets.forEach(set => {
              const weight = set.weight_kg_used || 0;
              const reps = set.reps_completed || 0;
              
              if (weight > maxWeight) maxWeight = weight;
              totalReps += reps;
            });
            
            dateSessions.push({
              date: dateSession.date,
              sets: sortedSets,
              maxWeight: maxWeight || null,
              totalReps
            });
          });
          
          // Sort sessions by date (most recent first)
          const sessions = dateSessions.sort((a, b) => {
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
          
          console.log('Sessions processed:', sessions.length);
          console.log('Date sessions map size:', dateSessionsMap.size);
          console.log('Sessions dates:', sessions.map(s => s.date));
          
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
