
import { useState, useEffect } from "react";
import { Exercise } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch exercises from Supabase
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('exercises')
          .select('*');
        
        if (error) {
          console.error('Error fetching exercises:', error);
          toast.error('Error al cargar ejercicios');
          // Fall back to mock data if there's an error
          setExercises(getMockExercises());
          return;
        }
        
        if (data && data.length > 0) {
          setExercises(data as Exercise[]);
        } else {
          // If no data from Supabase, use mock data
          console.log('No exercises found in database, using mock data');
          setExercises(getMockExercises());
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar ejercicios');
        // Fall back to mock data if there's an exception
        setExercises(getMockExercises());
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Mock data function
  const getMockExercises = (): Exercise[] => {
    return [
      {
        id: 1,
        name: "Press de Banca",
        muscle_group_main: "Pecho",
        equipment_required: "Barra",
        difficulty_level: "Intermedio",
        video_url: "/exercises/bench-press.mp4"
      },
      {
        id: 2,
        name: "Sentadilla",
        muscle_group_main: "Piernas",
        equipment_required: "Peso Corporal",
        difficulty_level: "Principiante",
        video_url: "/exercises/squat.mp4"
      },
      {
        id: 3,
        name: "Pull-up",
        muscle_group_main: "Espalda",
        equipment_required: "Barra de dominadas",
        difficulty_level: "Avanzado",
        video_url: "/exercises/pull-up.mp4"
      },
      {
        id: 4,
        name: "Plancha",
        muscle_group_main: "Core",
        equipment_required: "Peso Corporal",
        difficulty_level: "Principiante",
        video_url: "/exercises/plank.mp4"
      },
      {
        id: 5,
        name: "Extensión de Tríceps",
        muscle_group_main: "Tríceps",
        equipment_required: "Mancuernas",
        difficulty_level: "Principiante",
        video_url: "/exercises/triceps.mp4"
      },
      {
        id: 6,
        name: "Curl de Bíceps",
        muscle_group_main: "Bíceps",
        equipment_required: "Mancuernas",
        difficulty_level: "Principiante",
        video_url: "/exercises/biceps-curl.mp4"
      }
    ];
  };

  return {
    exercises,
    loading
  };
};
