
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ExerciseStats, UseExerciseHistoryProps, ExerciseHistoryReturn } from "./types/exerciseHistory";
import { processExerciseData } from "./utils/exerciseDataProcessor";
import { fetchExerciseHistory } from "./services/exerciseHistoryService";

export const useExerciseHistory = ({ exerciseId }: UseExerciseHistoryProps): ExerciseHistoryReturn => {
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
    
    const loadExerciseHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchExerciseHistory(exerciseId);
        const processedStats = processExerciseData(data || []);
        
        console.log('Processed sessions by date:', processedStats.sessions);
        console.log('Sessions count:', processedStats.sessions.length);
        console.log('Unique dates:', processedStats.sessions.map(s => s.date));
        
        setStats(processedStats);
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
    
    loadExerciseHistory();
  }, [exerciseId, toast]);
  
  return {
    stats,
    loading,
    isEmpty: stats.sessions.length === 0
  };
};
