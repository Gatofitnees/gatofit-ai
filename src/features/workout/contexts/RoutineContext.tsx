
import React, { createContext, useContext, useState } from 'react';
import { RoutineExercise, WorkoutBlock } from '../types';

// Define the shape of our context state
interface RoutineContextType {
  // State
  routineName: string;
  routineType: string;
  routineExercises: RoutineExercise[];
  workoutBlocks: WorkoutBlock[];
  isSubmitting: boolean;
  
  // UI State
  showNoExercisesDialog: boolean;
  showSaveConfirmDialog: boolean;
  showDiscardChangesDialog: boolean;
  showExerciseOptionsSheet: boolean;
  showReorderSheet: boolean;
  showBlockTypeSelector: boolean;
  currentExerciseIndex: number | null;
  currentBlockIndex: number | null;
  pendingNavigation: string | null;
  
  // State setters
  setRoutineName: (name: string) => void;
  setRoutineType: (type: string) => void;
  setRoutineExercises: (exercises: RoutineExercise[]) => void;
  setWorkoutBlocks: (blocks: WorkoutBlock[]) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  
  // UI State setters
  setShowNoExercisesDialog: (show: boolean) => void;
  setShowSaveConfirmDialog: (show: boolean) => void;
  setShowDiscardChangesDialog: (show: boolean) => void;
  setShowExerciseOptionsSheet: (show: boolean) => void;
  setShowReorderSheet: (show: boolean) => void;
  setShowBlockTypeSelector: (show: boolean) => void;
  setCurrentExerciseIndex: (index: number | null) => void;
  setCurrentBlockIndex: (index: number | null) => void;
  setPendingNavigation: (path: string | null) => void;
}

// Create context with default values
const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

// Provider component
export const RoutineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core routine state
  const [routineName, setRoutineName] = useState('');
  const [routineType, setRoutineType] = useState('');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [workoutBlocks, setWorkoutBlocks] = useState<WorkoutBlock[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI state
  const [showNoExercisesDialog, setShowNoExercisesDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showDiscardChangesDialog, setShowDiscardChangesDialog] = useState(false);
  const [showExerciseOptionsSheet, setShowExerciseOptionsSheet] = useState(false);
  const [showReorderSheet, setShowReorderSheet] = useState(false);
  const [showBlockTypeSelector, setShowBlockTypeSelector] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const value = {
    // State
    routineName,
    routineType,
    routineExercises,
    workoutBlocks,
    isSubmitting,
    
    // UI State
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    showBlockTypeSelector,
    currentExerciseIndex,
    currentBlockIndex,
    pendingNavigation,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setWorkoutBlocks,
    setIsSubmitting,
    
    // UI State setters
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    setShowBlockTypeSelector,
    setCurrentExerciseIndex,
    setCurrentBlockIndex,
    setPendingNavigation,
  };

  return (
    <RoutineContext.Provider value={value}>
      {children}
    </RoutineContext.Provider>
  );
};

// Hook to use the context
export const useRoutineContext = () => {
  const context = useContext(RoutineContext);
  
  if (context === undefined) {
    throw new Error('useRoutineContext must be used within a RoutineProvider');
  }
  
  return context;
};
