
import { useState, useEffect, useRef } from "react";
import { WorkoutExercise, WorkoutSet, PreviousData } from "../types/workout";

interface UseBaseExerciseDataProps {
  exerciseDetails: any[];
  previousData: Record<number, PreviousData[]>;
  exerciseNotesMap: Record<number, string>;
  previousDataLoaded: boolean;
}

export function useBaseExerciseData({
  exerciseDetails,
  previousData,
  exerciseNotesMap,
  previousDataLoaded
}: UseBaseExerciseDataProps) {
  const [baseExerciseData, setBaseExerciseData] = useState<Record<number, WorkoutExercise>>({});
  const isInitialized = useRef(false);

  // Initialize base exercises only once when previous data is loaded
  useEffect(() => {
    if (!exerciseDetails.length || !previousDataLoaded || isInitialized.current) return;
    
    console.log("Initializing base exercises for the first time");
    
    const initialBaseExercises: Record<number, WorkoutExercise> = {};
    
    exerciseDetails.forEach(ex => {
      const formattedSets: WorkoutSet[] = Array.from(
        { length: ex.sets || 0 },
        (_, i) => ({
          set_number: i + 1,
          weight: null,
          reps: null,
          notes: "",
          previous_weight: previousData[ex.id]?.[i]?.weight || null,
          previous_reps: previousData[ex.id]?.[i]?.reps || null
        })
      );

      initialBaseExercises[ex.id] = {
        id: ex.id,
        name: ex.name,
        sets: formattedSets,
        muscle_group_main: ex.muscle_group_main,
        equipment_required: ex.equipment_required,
        notes: exerciseNotesMap[ex.id] || ""
      };
    });
    
    setBaseExerciseData(initialBaseExercises);
    isInitialized.current = true;
  }, [exerciseDetails, previousDataLoaded, previousData, exerciseNotesMap]);

  const updateBaseExerciseData = (exerciseId: number, updater: (prev: WorkoutExercise) => WorkoutExercise) => {
    setBaseExerciseData(prev => {
      const updated = { ...prev };
      if (updated[exerciseId]) {
        updated[exerciseId] = updater(updated[exerciseId]);
      }
      return updated;
    });
  };

  return {
    baseExerciseData,
    updateBaseExerciseData,
    isInitialized: isInitialized.current
  };
}
