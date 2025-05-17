
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToastHelper } from "@/hooks/useToastHelper";

export interface Exercise {
  id: number;
  name: string;
  muscle_group_main?: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
}

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToastHelper();
  
  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching exercises...");
      const { data, error } = await supabase
        .from('exercises')
        .select('*');
        
      if (error) {
        console.error("Error fetching exercises:", error);
        setError(error.message);
        throw error;
      }
      
      console.log("Exercises data:", data);
      setExercises(data || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
      toast.showError(
        "Error", 
        "No se pudieron cargar los ejercicios"
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchExercises();
  }, []);
  
  return {
    exercises,
    isLoading,
    error,
    fetchExercises
  };
};
