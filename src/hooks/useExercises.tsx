
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
        const { data, error } = await supabase
          .from('exercises')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Asegurar IDs únicas en los datos de la base de datos
          const uniqueExercises = removeDuplicateIds(data as Exercise[]);
          setExercises(uniqueExercises);
        } else {
          // Si no hay datos en la BD, usar los ejercicios precargados
          // Combinar ejercicios precargados y adicionales, asegurando IDs únicas
          const allExercises = removeDuplicateIds([...preloadedExercises, ...additionalExercises]);
          setExercises(allExercises);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        // Fallback a ejercicios precargados si falla la consulta
        const allExercises = removeDuplicateIds([...preloadedExercises, ...additionalExercises]);
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

  // Función para eliminar IDs duplicados y asignar nuevas IDs únicas si es necesario
  const removeDuplicateIds = (exercisesList: Exercise[]): Exercise[] => {
    const seenIds = new Set<number>();
    const uniqueExercises: Exercise[] = [];
    let nextId = 10000; // ID base para nuevas asignaciones
    
    exercisesList.forEach(exercise => {
      // Si el ID ya existe, asignar un nuevo ID único
      if (seenIds.has(exercise.id)) {
        console.log(`ID duplicado encontrado: ${exercise.id} para ejercicio ${exercise.name}. Asignando nuevo ID: ${nextId}`);
        uniqueExercises.push({
          ...exercise,
          id: nextId++
        });
      } else {
        seenIds.add(exercise.id);
        uniqueExercises.push(exercise);
      }
    });
    
    return uniqueExercises;
  };

  // Extraer y normalizar grupos musculares únicos de todos los ejercicios
  const getMuscleGroups = () => {
    const muscleSet = new Set<string>();
    
    exercises.forEach(exercise => {
      if (!exercise.muscle_group_main) return;
      
      // Dividir por espacios y agregar cada grupo muscular
      const muscles = exercise.muscle_group_main.split(' ');
      muscles.forEach(muscle => {
        if (muscle.trim()) {
          muscleSet.add(muscle.trim());
        }
      });
    });
    
    return Array.from(muscleSet).sort();
  };

  // Extraer y normalizar tipos de equipamiento únicos de todos los ejercicios
  const getEquipmentTypes = () => {
    const equipmentSet = new Set<string>();
    
    exercises.forEach(exercise => {
      if (!exercise.equipment_required) return;
      
      // Dividir por espacios y agregar cada tipo de equipamiento
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
