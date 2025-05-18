
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
      
      // If no data, add sample exercises for now
      if (!data || data.length === 0) {
        const sampleExercises = [
          {
            id: 1,
            name: "Aperturas con mancuernas en banco inclinado",
            muscle_group_main: "Pecho",
            equipment_required: "Mancuernas",
            difficulty_level: "Intermedio",
            video_url: "https://storage.cloud.google.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-con-mancuernas-en-banco-inclinado.mp4"
          },
          {
            id: 2,
            name: "Aperturas con mancuernas",
            muscle_group_main: "Pecho",
            equipment_required: "Mancuernas",
            difficulty_level: "Intermedio",
            video_url: "https://storage.cloud.google.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-con-mancuernas.mp4"
          },
          {
            id: 3,
            name: "Press de banca",
            muscle_group_main: "Pecho",
            equipment_required: "Barra",
            difficulty_level: "Intermedio",
            video_url: "https://storage.cloud.google.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/press-de-banca.mp4"
          },
          {
            id: 4,
            name: "Sentadilla",
            muscle_group_main: "Pierna",
            equipment_required: "Ninguno",
            difficulty_level: "Básico",
            video_url: null
          },
          {
            id: 5,
            name: "Curl de bíceps",
            muscle_group_main: "Bíceps",
            equipment_required: "Mancuernas",
            difficulty_level: "Básico",
            video_url: null
          }
        ];
        
        setExercises(sampleExercises);
      } else {
        console.log("Exercises data:", data);
        setExercises(data || []);
      }
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
