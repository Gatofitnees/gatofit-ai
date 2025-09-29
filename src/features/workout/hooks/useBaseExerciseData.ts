
import { useState, useEffect, useRef } from "react";
import { WorkoutExercise, WorkoutSet, PreviousData } from "../types/workout";

interface UseBaseExerciseDataProps {
  exerciseDetails: any[];
  previousData: Record<number, PreviousData[]>;
  exerciseNotesMap: Record<number, string>;
  previousDataLoaded: boolean;
  routineId?: number;
}

export function useBaseExerciseData({
  exerciseDetails,
  previousData,
  exerciseNotesMap,
  previousDataLoaded,
  routineId
}: UseBaseExerciseDataProps) {
  const [baseExerciseData, setBaseExerciseData] = useState<Record<number, WorkoutExercise>>({});
  const isInitialized = useRef(false);
  const initializedExerciseIds = useRef<Set<number>>(new Set());

  // Helper function to get storage key
  const getStorageKey = () => routineId ? `base_exercise_data_${routineId}` : null;

  // Helper function to save data to sessionStorage
  const saveToStorage = (data: Record<number, WorkoutExercise>) => {
    const storageKey = getStorageKey();
    if (storageKey && Object.keys(data).length > 0) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(data));
        console.log("Saved base exercise data to storage:", Object.keys(data).length, "exercises");
      } catch (error) {
        console.error("Error saving base exercise data:", error);
      }
    }
  };

  // Helper function to load data from sessionStorage
  const loadFromStorage = (): Record<number, WorkoutExercise> => {
    const storageKey = getStorageKey();
    if (!storageKey) return {};

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("Loaded base exercise data from storage:", Object.keys(parsed).length, "exercises");
        return parsed;
      }
    } catch (error) {
      console.error("Error loading base exercise data:", error);
    }
    return {};
  };

  // Initialize base exercises only once when previous data is loaded
  useEffect(() => {
    if (!exerciseDetails.length || !previousDataLoaded || isInitialized.current) return;
    
    console.log("Initializing base exercises for the first time");
    console.log("Available previous data:", previousData);
    
    // Try to load existing data from storage first
    const storedData = loadFromStorage();
    const initialBaseExercises: Record<number, WorkoutExercise> = {};
    
    exerciseDetails.forEach(ex => {
      const exerciseId = ex.exercise_id; // Use exercise_id instead of id
      const exerciseName = ex.exercises?.name || 'Unknown Exercise';
      
      console.log(`Processing exercise ${exerciseId} (${exerciseName})`);
      console.log(`Previous data for exercise ${exerciseId}:`, previousData[exerciseId]);
      
      // Check if we have stored data for this exercise
      const storedExercise = storedData[exerciseId];
      
      if (storedExercise && storedExercise.sets.length > 0) {
        // Use stored data but update previous data and add target reps
        const updatedSets = storedExercise.sets.map((set, i) => {
          const prevWeight = previousData[exerciseId]?.[i]?.weight || null;
          const prevReps = previousData[exerciseId]?.[i]?.reps || null;
          
          console.log(`Set ${i + 1} - Previous: ${prevWeight}kg × ${prevReps}`);
          
          return {
            ...set,
            previous_weight: prevWeight,
            previous_reps: prevReps,
            target_reps_min: ex.reps_min || undefined,
            target_reps_max: ex.reps_max || undefined
          };
        });
        
        initialBaseExercises[exerciseId] = {
          ...storedExercise,
          sets: updatedSets,
          notes: ex.notes || "", // Routine creator notes from database
          user_notes: storedExercise.user_notes || "", // User workout notes from storage
          rest_between_sets_seconds: ex.rest_between_sets_seconds // Update with current rest time
        };
        console.log(`Using stored data for exercise ${exerciseId} with user inputs preserved`);
      } else {
        // Create fresh exercise with target reps
        const formattedSets: WorkoutSet[] = Array.from(
          { length: ex.sets || 1 },
          (_, i) => {
            const prevWeight = previousData[exerciseId]?.[i]?.weight || null;
            const prevReps = previousData[exerciseId]?.[i]?.reps || null;
            
            console.log(`Fresh set ${i + 1} - Previous: ${prevWeight}kg × ${prevReps}`);
            
            return {
              set_number: i + 1,
              weight: null,
              reps: null,
              notes: "",
              previous_weight: prevWeight,
              previous_reps: prevReps,
              target_reps_min: ex.reps_min || undefined,
              target_reps_max: ex.reps_max || undefined
            };
          }
        );

        initialBaseExercises[exerciseId] = {
          id: exerciseId,
          name: exerciseName,
          sets: formattedSets,
          muscle_group_main: ex.exercises?.muscle_group_main,
          equipment_required: ex.exercises?.equipment_required,
          notes: ex.notes || "", // Routine creator notes from database
          user_notes: "", // Initialize user workout notes as empty
          rest_between_sets_seconds: ex.rest_between_sets_seconds
        };
        console.log(`Created fresh exercise ${exerciseId} with target reps:`, ex.reps_min, "-", ex.reps_max);
      }
      
      initializedExerciseIds.current.add(exerciseId);
    });
    
    console.log("Final base exercises data:", initialBaseExercises);
    setBaseExerciseData(initialBaseExercises);
    saveToStorage(initialBaseExercises);
    isInitialized.current = true;
  }, [exerciseDetails, previousDataLoaded, previousData, exerciseNotesMap, routineId]);

  // Add new exercises if they appear in exerciseDetails but aren't in baseExerciseData
  useEffect(() => {
    if (!isInitialized.current || !exerciseDetails.length) return;
    
    const newExercises: Record<number, WorkoutExercise> = {};
    let hasNewExercises = false;
    
    exerciseDetails.forEach(ex => {
      const exerciseId = ex.exercise_id; // Use exercise_id instead of id
      
      if (!initializedExerciseIds.current.has(exerciseId)) {
        console.log(`Adding new base exercise ${exerciseId} to existing data`);
        
        const formattedSets: WorkoutSet[] = Array.from(
          { length: ex.sets || 1 },
          (_, i) => ({
            set_number: i + 1,
            weight: null,
            reps: null,
            notes: "",
            previous_weight: previousData[exerciseId]?.[i]?.weight || null,
            previous_reps: previousData[exerciseId]?.[i]?.reps || null,
            target_reps_min: ex.reps_min || undefined,
            target_reps_max: ex.reps_max || undefined
          })
        );

        newExercises[exerciseId] = {
          id: exerciseId,
          name: ex.exercises?.name || 'Unknown Exercise',
          sets: formattedSets,
          muscle_group_main: ex.exercises?.muscle_group_main,
          equipment_required: ex.exercises?.equipment_required,
          notes: ex.notes || "", // Routine creator notes from database
          user_notes: "", // Initialize user workout notes as empty
          rest_between_sets_seconds: ex.rest_between_sets_seconds
        };
        
        initializedExerciseIds.current.add(exerciseId);
        hasNewExercises = true;
      }
    });
    
    if (hasNewExercises) {
      setBaseExerciseData(prev => {
        const updated = { ...prev, ...newExercises };
        saveToStorage(updated);
        return updated;
      });
    }
  }, [exerciseDetails, previousData, exerciseNotesMap, routineId]);

  const updateBaseExerciseData = (exerciseId: number, updater: (prev: WorkoutExercise) => WorkoutExercise) => {
    setBaseExerciseData(prev => {
      const updated = { ...prev };
      if (updated[exerciseId]) {
        updated[exerciseId] = updater(updated[exerciseId]);
        console.log(`Updated base exercise ${exerciseId}:`, updated[exerciseId].sets.map(s => ({ weight: s.weight, reps: s.reps })));
        
        // Save to storage immediately after update
        saveToStorage(updated);
      }
      return updated;
    });
  };

  // Clear storage when component unmounts or routine changes
  const clearStoredData = () => {
    const storageKey = getStorageKey();
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
      console.log("Cleared base exercise data from storage");
    }
  };

  return {
    baseExerciseData,
    updateBaseExerciseData,
    clearStoredData,
    isInitialized: isInitialized.current
  };
}
