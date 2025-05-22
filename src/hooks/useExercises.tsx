
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { preloadedExercises } from "@/data/preloadedExercises";
import { additionalExercises } from "@/data/additionalExercises";
import { Exercise } from "@/features/workout/types";

export const useExercises = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        console.log("Fetching exercises from Supabase...");
        const { data, error } = await supabase
          .from('exercises')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log("Loaded exercises from Supabase:", data.length);
          setExercises(data as Exercise[]);
        } else {
          // If no data returned from DB, use preloaded exercises
          // Combine both preloaded and additional exercises
          console.log("No exercises found in database, loading preloaded exercises");
          const allExercises = [...preloadedExercises, ...additionalExercises];
          console.log("Preloaded exercises:", allExercises.length);
          setExercises(allExercises);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        // Fallback to preloaded exercises if fetch fails
        const allExercises = [...preloadedExercises, ...additionalExercises];
        console.log("Falling back to preloaded exercises due to error");
        setExercises(allExercises);
        toast({
          title: "Error",
          description: "No se pudieron cargar los ejercicios",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [toast]);

  // Extract and normalize unique muscle groups from all exercises
  const getMuscleGroups = () => {
    const muscleSet = new Set<string>();
    
    exercises.forEach(exercise => {
      if (!exercise.muscle_group_main) return;
      
      // Split by spaces and add each muscle group
      const muscles = exercise.muscle_group_main.split(' ');
      muscles.forEach(muscle => {
        if (muscle.trim()) {
          muscleSet.add(muscle.trim());
        }
      });
    });
    
    return Array.from(muscleSet).sort();
  };

  // Extract and normalize unique equipment types from all exercises
  const getEquipmentTypes = () => {
    const equipmentSet = new Set<string>();
    
    exercises.forEach(exercise => {
      if (!exercise.equipment_required) return;
      
      // Split by spaces and add each equipment type
      const equipment = exercise.equipment_required.split(' ');
      equipment.forEach(item => {
        if (item.trim()) {
          equipmentSet.add(item.trim());
        }
      });
    });
    
    return Array.from(equipmentSet).sort();
  };
  
  return {
    exercises,
    loading,
    muscleGroups: getMuscleGroups(),
    equipmentTypes: getEquipmentTypes()
  };
};
