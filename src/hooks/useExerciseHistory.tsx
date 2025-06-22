
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
        console.log('Fetching exercise history for exerciseId:', exerciseId);
        
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
        
        console.log('Raw data from database:', data);
        
        if (data && data.length > 0) {
          let globalMaxWeight = 0;
          let globalMaxReps = 0;
          
          // Agrupar por fecha única - cada fecha debe tener UNA sola sesión
          const sessionsByDate = new Map<string, ExerciseSession>();
          
          data.forEach((entry) => {
            const workoutLog = Array.isArray(entry.workout_log) 
              ? entry.workout_log[0] 
              : entry.workout_log;
            
            if (!workoutLog?.workout_date) return;
            
            const displayDate = new Date(workoutLog.workout_date).toLocaleDateString('es-ES');
            const weight = entry.weight_kg_used || 0;
            const reps = entry.reps_completed || 0;
            
            // Calcular estadísticas globales
            if (weight > globalMaxWeight) globalMaxWeight = weight;
            if (reps > globalMaxReps) globalMaxReps = reps;
            
            // Si ya existe una sesión para esta fecha, añadir la serie
            if (sessionsByDate.has(displayDate)) {
              const existingSession = sessionsByDate.get(displayDate)!;
              
              // Añadir la serie a la sesión existente
              existingSession.sets.push({
                set_number: entry.set_number,
                weight_kg_used: entry.weight_kg_used,
                reps_completed: entry.reps_completed
              });
              
              // Actualizar estadísticas de la sesión
              if (weight > (existingSession.maxWeight || 0)) {
                existingSession.maxWeight = weight;
              }
              existingSession.totalReps += reps;
              
            } else {
              // Crear nueva sesión para esta fecha
              sessionsByDate.set(displayDate, {
                date: displayDate,
                sets: [{
                  set_number: entry.set_number,
                  weight_kg_used: entry.weight_kg_used,
                  reps_completed: entry.reps_completed
                }],
                maxWeight: weight || null,
                totalReps: reps
              });
            }
          });
          
          // Convertir el Map a array y ordenar las series dentro de cada sesión
          const sessions = Array.from(sessionsByDate.values()).map(session => ({
            ...session,
            sets: session.sets.sort((a, b) => a.set_number - b.set_number)
          }));
          
          // Ordenar sesiones por fecha (más reciente primero)
          const sortedSessions = sessions.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
          });
          
          // Crear datos de progreso para el gráfico (orden cronológico)
          const progressData = sortedSessions
            .filter(session => session.maxWeight && session.maxWeight > 0)
            .reverse() // Orden cronológico para el gráfico
            .map(session => ({
              date: session.date,
              maxWeight: session.maxWeight!
            }));
          
          console.log('Processed sessions by date:', sortedSessions);
          console.log('Sessions count:', sortedSessions.length);
          console.log('Unique dates:', sortedSessions.map(s => s.date));
          
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
