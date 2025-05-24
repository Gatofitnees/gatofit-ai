
import { WorkoutExercise } from "../types/workout";

interface UseExerciseInputHandlersProps {
  exercises: WorkoutExercise[];
  exerciseDetails: any[];
  updateBaseExerciseData: (exerciseId: number, updater: (prev: WorkoutExercise) => WorkoutExercise) => void;
  updateTemporaryExercise: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void;
  updateTemporaryExerciseNotes: (exerciseIndex: number, notes: string) => void;
  addTemporaryExerciseSet: (exerciseIndex: number) => void;
}

export function useExerciseInputHandlers({
  exercises,
  exerciseDetails,
  updateBaseExerciseData,
  updateTemporaryExercise,
  updateTemporaryExerciseNotes,
  addTemporaryExerciseSet
}: UseExerciseInputHandlersProps) {

  const handleInputChange = (
    exerciseIndex: number, 
    setIndex: number, 
    field: 'weight' | 'reps', 
    value: string
  ) => {
    const baseExerciseCount = exerciseDetails.length;
    
    console.log(`Input change - Exercise ${exerciseIndex}, Set ${setIndex}, Field: ${field}, Value: ${value}`);
    
    // Check if this is a temporary exercise
    if (exerciseIndex >= baseExerciseCount) {
      const tempIndex = exerciseIndex - baseExerciseCount;
      updateTemporaryExercise(tempIndex, setIndex, field, value);
      return;
    }
    
    // Handle base exercises - update the baseExerciseData
    const exercise = exercises[exerciseIndex];
    if (!exercise) return;
    
    const numValue = value === '' ? null : Number(value);
    
    console.log(`Updating base exercise ${exercise.id} set ${setIndex} ${field} to:`, numValue);
    
    updateBaseExerciseData(exercise.id, (prev) => ({
      ...prev,
      sets: prev.sets.map((set, idx) => 
        idx === setIndex 
          ? { ...set, [field]: numValue }
          : set
      )
    }));
  };

  const handleExerciseNotesChange = (exerciseIndex: number, notes: string) => {
    const baseExerciseCount = exerciseDetails.length;
    
    // Check if this is a temporary exercise
    if (exerciseIndex >= baseExerciseCount) {
      const tempIndex = exerciseIndex - baseExerciseCount;
      updateTemporaryExerciseNotes(tempIndex, notes);
      return;
    }
    
    // Handle base exercises - update the baseExerciseData
    const exercise = exercises[exerciseIndex];
    if (!exercise) return;
    
    updateBaseExerciseData(exercise.id, (prev) => ({
      ...prev,
      notes: notes
    }));
  };

  const handleAddSet = (exerciseIndex: number) => {
    const baseExerciseCount = exerciseDetails.length;
    
    // Check if this is a temporary exercise
    if (exerciseIndex >= baseExerciseCount) {
      const tempIndex = exerciseIndex - baseExerciseCount;
      addTemporaryExerciseSet(tempIndex);
      return;
    }
    
    // Handle base exercises - update the baseExerciseData
    const exercise = exercises[exerciseIndex];
    if (!exercise) return;
    
    updateBaseExerciseData(exercise.id, (prev) => {
      const lastSet = prev.sets[prev.sets.length - 1];
      
      return {
        ...prev,
        sets: [
          ...prev.sets,
          {
            set_number: prev.sets.length + 1,
            weight: lastSet?.weight || null,
            reps: lastSet?.reps || null,
            notes: "",
            previous_weight: null,
            previous_reps: null
          }
        ]
      };
    });
  };

  return {
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet
  };
}
