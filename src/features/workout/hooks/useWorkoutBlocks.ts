import { useState, useCallback } from "react";
import { WorkoutBlock, BlockType, RoutineExercise } from "../types";

export function useWorkoutBlocks() {
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [showBlockTypeSelector, setShowBlockTypeSelector] = useState(false);

  // Create a new block
  const createBlock = useCallback((type: BlockType) => {
    const blockId = `block-${Date.now()}`;
    const title = type === "calentamiento" ? "Calentamiento" : "Series Efectivas";
    
    const newBlock: WorkoutBlock = {
      id: blockId,
      type,
      title,
      exercises: [],
    };

    setBlocks(prev => [...prev, newBlock]);
  }, []);

  // Add exercises to a specific block
  const addExercisesToBlock = useCallback((blockIndex: number, exercises: RoutineExercise[]) => {
    setBlocks(prev => {
      const updatedBlocks = [...prev];
      
      // Check if blockIndex is valid and block exists
      if (blockIndex < 0 || blockIndex >= updatedBlocks.length || !updatedBlocks[blockIndex]) {
        console.error(`❌ [BLOCKS] Invalid blockIndex: ${blockIndex}, available blocks: ${updatedBlocks.length}`);
        return prev; // Return unchanged state if invalid
      }
      
      const existingIds = new Set(updatedBlocks[blockIndex].exercises.map(ex => ex.id));
      const newExercises = exercises.filter(ex => !existingIds.has(ex.id));
      
      console.log(`✅ [BLOCKS] Adding ${newExercises.length} exercises to block ${blockIndex}`);
      
      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        exercises: [...updatedBlocks[blockIndex].exercises, ...newExercises],
      };
      
      return updatedBlocks;
    });
  }, []);

  // Add a set to an exercise in a block
  const addSetToExercise = useCallback((blockIndex: number, exerciseIndex: number) => {
    setBlocks(prev => {
      const updatedBlocks = [...prev];
      
      // Check bounds
      if (blockIndex < 0 || blockIndex >= updatedBlocks.length || !updatedBlocks[blockIndex]) {
        console.error(`❌ [BLOCKS] Invalid blockIndex for addSet: ${blockIndex}`);
        return prev;
      }
      
      const exercises = updatedBlocks[blockIndex].exercises;
      if (exerciseIndex < 0 || exerciseIndex >= exercises.length || !exercises[exerciseIndex]) {
        console.error(`❌ [BLOCKS] Invalid exerciseIndex for addSet: ${exerciseIndex}`);
        return prev;
      }
      
      const exercise = exercises[exerciseIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];
      
      updatedBlocks[blockIndex].exercises[exerciseIndex].sets.push({
        reps_min: lastSet.reps_min,
        reps_max: lastSet.reps_max,
        rest_seconds: lastSet.rest_seconds,
      });
      
      return updatedBlocks;
    });
  }, []);

  // Update a set in an exercise
  const updateExerciseSet = useCallback((
    blockIndex: number,
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: number
  ) => {
    setBlocks(prev => {
      const updatedBlocks = [...prev];
      
      // Check bounds
      if (blockIndex < 0 || blockIndex >= updatedBlocks.length || !updatedBlocks[blockIndex]) {
        console.error(`❌ [BLOCKS] Invalid blockIndex for updateSet: ${blockIndex}`);
        return prev;
      }
      
      const exercises = updatedBlocks[blockIndex].exercises;
      if (exerciseIndex < 0 || exerciseIndex >= exercises.length || !exercises[exerciseIndex]) {
        console.error(`❌ [BLOCKS] Invalid exerciseIndex for updateSet: ${exerciseIndex}`);
        return prev;
      }
      
      const sets = exercises[exerciseIndex].sets;
      if (setIndex < 0 || setIndex >= sets.length) {
        console.error(`❌ [BLOCKS] Invalid setIndex for updateSet: ${setIndex}`);
        return prev;
      }
      
      updatedBlocks[blockIndex].exercises[exerciseIndex].sets[setIndex] = {
        ...updatedBlocks[blockIndex].exercises[exerciseIndex].sets[setIndex],
        [field]: value,
      };
      
      return updatedBlocks;
    });
  }, []);

  // Remove an exercise from a block
  const removeExerciseFromBlock = useCallback((blockIndex: number, exerciseIndex: number) => {
    setBlocks(prev => {
      const updatedBlocks = [...prev];
      
      // Check bounds
      if (blockIndex < 0 || blockIndex >= updatedBlocks.length || !updatedBlocks[blockIndex]) {
        console.error(`❌ [BLOCKS] Invalid blockIndex for removeExercise: ${blockIndex}`);
        return prev;
      }
      
      const exercises = updatedBlocks[blockIndex].exercises;
      if (exerciseIndex < 0 || exerciseIndex >= exercises.length) {
        console.error(`❌ [BLOCKS] Invalid exerciseIndex for removeExercise: ${exerciseIndex}`);
        return prev;
      }
      
      updatedBlocks[blockIndex].exercises.splice(exerciseIndex, 1);
      return updatedBlocks;
    });
  }, []);

  // Move exercise within a block
  const moveExerciseInBlock = useCallback((blockIndex: number, fromIndex: number, toIndex: number) => {
    setBlocks(prev => {
      const updatedBlocks = [...prev];
      
      // Check bounds
      if (blockIndex < 0 || blockIndex >= updatedBlocks.length || !updatedBlocks[blockIndex]) {
        console.error(`❌ [BLOCKS] Invalid blockIndex for moveExercise: ${blockIndex}`);
        return prev;
      }
      
      const exercises = updatedBlocks[blockIndex].exercises;
      if (fromIndex < 0 || fromIndex >= exercises.length || toIndex < 0 || toIndex >= exercises.length) {
        console.error(`❌ [BLOCKS] Invalid indices for moveExercise: from ${fromIndex}, to ${toIndex}`);
        return prev;
      }
      
      const [movedExercise] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, movedExercise);
      return updatedBlocks;
    });
  }, []);

  // Convert blocks to flat exercise list (for saving)
  const convertBlocksToExercises = useCallback((): RoutineExercise[] => {
    return blocks.flatMap(block => block.exercises);
  }, [blocks]);

  // Convert flat exercise list to blocks (for loading)
  const convertExercisesToBlocks = useCallback((exercises: RoutineExercise[]) => {
    if (exercises.length === 0) {
      setBlocks([]);
      return;
    }

    // For now, put all exercises in a "Series Efectivas" block
    // This maintains compatibility with existing routines
    const defaultBlock: WorkoutBlock = {
      id: `block-${Date.now()}`,
      type: "series_efectivas",
      title: "Series Efectivas",
      exercises: exercises,
    };

    setBlocks([defaultBlock]);
  }, []);

  // Reset blocks
  const resetBlocks = useCallback(() => {
    setBlocks([]);
  }, []);

  return {
    blocks,
    setBlocks,
    showBlockTypeSelector,
    setShowBlockTypeSelector,
    createBlock,
    addExercisesToBlock,
    addSetToExercise,
    updateExerciseSet,
    removeExerciseFromBlock,
    moveExerciseInBlock,
    convertBlocksToExercises,
    convertExercisesToBlocks,
    resetBlocks,
  };
}