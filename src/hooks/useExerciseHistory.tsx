
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
          
          // Group by unique dates first
          const dateToWorkoutLogsMap = new Map<string, Set<number>>();
          const allWorkoutData = new Map<number, any[]>();
          
          // First pass: organize data by workout_log_id and collect unique dates
          data.forEach((entry) => {
            const workoutLog = Array.isArray(entry.workout_log) 
              ? entry.workout_log[0] 
              : entry.workout_log;
            
            if (!workoutLog?.workout_date) return;
            
            const displayDate = new Date(workoutLog.workout_date).toLocaleDateString('es-ES');
            const workoutLogId = entry.workout_log_id;
            
            // Track which workout_log_ids belong to each date
            if (!dateToWorkoutLogsMap.has(displayDate)) {
              dateToWorkoutLogsMap.set(displayDate, new Set());
            }
            dateToWorkoutLogsMap.get(displayDate)!.add(workoutLogId);
            
            // Group workout data by workout_log_id
            if (!allWorkoutData.has(workoutLogId)) {
              allWorkoutData.set(workoutLogId, []);
            }
            allWorkoutData.get(workoutLogId)!.push(entry);
            
            // Calculate global stats
            const weight = entry.weight_kg_used || 0;
            const reps = entry.reps_completed || 0;
            if (weight > globalMaxWeight) globalMaxWeight = weight;
            if (reps > globalMaxReps) globalMaxReps = reps;
          });
          
          // Second pass: create sessions by date
          const sessions: ExerciseSession[] = [];
          
          dateToWorkoutLogsMap.forEach((workoutLogIds, date) => {
            // Collect all sets from all workouts on this date
            const allSetsForDate: Array<{
              set_number: number;
              weight_kg_used: number | null;
              reps_completed: number | null;
            }> = [];
            
            // For each workout on this date, add its sets
            workoutLogIds.forEach(workoutLogId => {
              const workoutData = allWorkoutData.get(workoutLogId) || [];
              workoutData.forEach(entry => {
                allSetsForDate.push({
                  set_number: entry.set_number,
                  weight_kg_used: entry.weight_kg_used,
                  reps_completed: entry.reps_completed
                });
              });
            });
            
            // Sort sets by set number
            const sortedSets = allSetsForDate.sort((a, b) => a.set_number - b.set_number);
            
            // Calculate stats for this date
            let maxWeight = 0;
            let totalReps = 0;
            
            sortedSets.forEach(set => {
              const weight = set.weight_kg_used || 0;
              const reps = set.reps_completed || 0;
              
              if (weight > maxWeight) maxWeight = weight;
              totalReps += reps;
            });
            
            sessions.push({
              date,
              sets: sortedSets,
              maxWeight: maxWeight || null,
              totalReps
            });
          });
          
          // Sort sessions by date (most recent first)
          const sortedSessions = sessions.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
          });
          
          // Create progress data for chart (chronological order)
          const progressData = sortedSessions
            .filter(session => session.maxWeight && session.maxWeight > 0)
            .reverse() // Chronological order for chart
            .map(session => ({
              date: session.date,
              maxWeight: session.maxWeight!
            }));
          
          console.log('Total unique dates found:', dateToWorkoutLogsMap.size);
          console.log('Sessions created:', sortedSessions.length);
          console.log('Available dates:', Array.from(dateToWorkoutLogsMap.keys()));
          
          setStats({
            maxWeight: globalMaxWeight || null,
            maxReps: globalMaxReps || null,
            sessions: sortedSessions,
            progressData
          });
        } else {
          console.log('No data found for exercise:', exerciseId);
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
