import { useState, useCallback } from "react";
import { WorkoutBlock, BlockType } from "../types/blocks";
import { RoutineExercise } from "../types";

export const useWorkoutBlocks = (
  routineExercises: RoutineExercise[],
  setRoutineExercises: (exercises: RoutineExercise[]) => void
) => {
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [showBlockTypeSelector, setShowBlockTypeSelector] = useState(false);
  const [currentBlockForExercises, setCurrentBlockForExercises] = useState<string | null>(null);

  // Create a new block
  const createBlock = useCallback((type: BlockType) => {
    const newBlock: WorkoutBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: type === "warmup" ? "Calentamiento" : "Series Efectivas",
      exercises: [],
      order: blocks.length
    };

    setBlocks(prev => [...prev, newBlock]);
    return newBlock;
  }, [blocks.length]);

  // Add exercises to a specific block
  const addExercisesToBlock = useCallback((blockId: string, newExercises: RoutineExercise[]) => {
    // First, add the new exercises to routineExercises
    const startIndex = routineExercises.length;
    const updatedRoutineExercises = [...routineExercises, ...newExercises];
    setRoutineExercises(updatedRoutineExercises);

    // Then update the block to reference these new exercises
    const newExerciseIndices = newExercises.map((_, index) => startIndex + index);
    
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, exercises: [...block.exercises, ...newExerciseIndices] }
        : block
    ));
  }, [routineExercises, setRoutineExercises]);

  // Remove an exercise from blocks when it's removed from routineExercises
  const removeExerciseFromBlocks = useCallback((exerciseIndex: number) => {
    setBlocks(prev => prev.map(block => ({
      ...block,
      exercises: block.exercises
        .filter(idx => idx !== exerciseIndex)
        .map(idx => idx > exerciseIndex ? idx - 1 : idx) // Adjust indices after removal
    })));
  }, []);

  // Move exercise within blocks (for reordering)
  const moveExerciseInBlocks = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks(prev => prev.map(block => ({
      ...block,
      exercises: block.exercises.map(idx => {
        if (idx === fromIndex) return toIndex;
        if (idx === toIndex) return fromIndex;
        return idx;
      })
    })));
  }, []);

  // Check if we have any blocks
  const hasBlocks = blocks.length > 0;

  // Get exercises not in any block (for backward compatibility)
  const getUnblockedExercises = useCallback(() => {
    const blockedIndices = new Set(blocks.flatMap(block => block.exercises));
    return routineExercises
      .map((exercise, index) => ({ exercise, index }))
      .filter(({ index }) => !blockedIndices.has(index));
  }, [blocks, routineExercises]);

  // Handle opening block type selector
  const handleAddBlock = useCallback(() => {
    setShowBlockTypeSelector(true);
  }, []);

  // Handle block type selection
  const handleBlockTypeSelect = useCallback((type: BlockType) => {
    createBlock(type);
    setShowBlockTypeSelector(false);
  }, [createBlock]);

  // Handle adding exercises to a specific block
  const handleAddExercisesToBlock = useCallback((blockId: string) => {
    setCurrentBlockForExercises(blockId);
  }, []);

  return {
    // State
    blocks,
    showBlockTypeSelector,
    currentBlockForExercises,
    hasBlocks,

    // Actions
    setBlocks,
    setShowBlockTypeSelector,
    setCurrentBlockForExercises,
    createBlock,
    addExercisesToBlock,
    removeExerciseFromBlocks,
    moveExerciseInBlocks,
    getUnblockedExercises,
    handleAddBlock,
    handleBlockTypeSelect,
    handleAddExercisesToBlock,
  };
};