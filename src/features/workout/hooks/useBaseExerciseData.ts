
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
  const initializedExerciseIds = useRef<Set<number>>(new Set());

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
      
      initializedExerciseIds.current.add(ex.id);
    });
    
    setBaseExerciseData(initialBaseExercises);
    isInitialized.current = true;
  }, [exerciseDetails, previousDataLoaded, previousData, exerciseNotesMap]);

  // Add new exercises if they appear in exerciseDetails but aren't in baseExerciseData
  useEffect(() => {
    if (!isInitialized.current || !exerciseDetails.length) return;
    
    const newExercises: Record<number, WorkoutExercise> = {};
    let hasNewExercises = false;
    
    exerciseDetails.forEach(ex => {
      if (!initializedExerciseIds.current.has(ex.id)) {
        console.log(`Adding new base exercise ${ex.id} to existing data`);
        
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

        newExercises[ex.id] = {
          id: ex.id,
          name: ex.name,
          sets: formattedSets,
          muscle_group_main: ex.muscle_group_main,
          equipment_required: ex.equipment_required,
          notes: exerciseNotesMap[ex.id] || ""
        };
        
        initializedExerciseIds.current.add(ex.id);
        hasNewExercises = true;
      }
    });
    
    if (hasNewExercises) {
      setBaseExerciseData(prev => ({ ...prev, ...newExercises }));
    }
  }, [exerciseDetails, previousData, exerciseNotesMap]);

  const updateBaseExerciseData = (exerciseId: number, updater: (prev: WorkoutExercise) => WorkoutExercise) => {
    setBaseExerciseData(prev => {
      const updated = { ...prev };
      if (updated[exerciseId]) {
        updated[exerciseId] = updater(updated[exerciseId]);
        console.log(`Updated base exercise ${exerciseId}:`, updated[exerciseId].sets.map(s => ({ weight: s.weight, reps: s.reps })));
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
