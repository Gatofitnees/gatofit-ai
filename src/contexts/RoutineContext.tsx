
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ExerciseSet {
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

export interface RoutineExercise {
  id: string;
  name: string;
  muscle_group_main?: string;
  sets: ExerciseSet[];
}

interface RoutineContextType {
  routineName: string;
  routineType: string;
  exercises: RoutineExercise[];
  isSubmitting: boolean;
  setRoutineName: (name: string) => void;
  setRoutineType: (type: string) => void;
  setExercises: (exercises: RoutineExercise[]) => void;
  addExercises: (exercises: RoutineExercise[]) => void;
  deleteExercise: (index: number) => void;
  reorderExercises: (newOrder: RoutineExercise[]) => void;
  validateForm: () => boolean;
  saveRoutine: () => Promise<void>;
  resetForm: () => void;
  loadInitialState: () => void;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

const STORAGE_KEY = 'workout_routine_draft';

export const RoutineProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [routineName, setRoutineName] = useState('');
  const [routineType, setRoutineType] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loadInitialState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const { name, type, exercises: savedExercises } = JSON.parse(savedState);
        setRoutineName(name || '');
        setRoutineType(type || '');
        setExercises(savedExercises || []);
      }
    } catch (error) {
      console.error('Failed to load routine state:', error);
    }
  }, []);
  
  // Load state from localStorage on first render
  React.useEffect(() => {
    loadInitialState();
  }, [loadInitialState]);
  
  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    try {
      const stateToSave = {
        name: routineName,
        type: routineType,
        exercises: exercises
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save routine state:', error);
    }
  }, [routineName, routineType, exercises]);
  
  const resetForm = useCallback(() => {
    setRoutineName('');
    setRoutineType('');
    setExercises([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  
  const addExercises = useCallback((newExercises: RoutineExercise[]) => {
    setExercises(prev => {
      // Create a map of existing exercise IDs to avoid duplicates
      const existingIds = new Set(prev.map(ex => ex.id));
      
      // Filter out any exercises that already exist
      const uniqueNewExercises = newExercises.filter(ex => !existingIds.has(ex.id));
      
      return [...prev, ...uniqueNewExercises];
    });
  }, []);
  
  const deleteExercise = useCallback((index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const reorderExercises = useCallback((newOrder: RoutineExercise[]) => {
    setExercises(newOrder);
  }, []);
  
  const validateForm = useCallback(() => {
    if (!routineName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la rutina",
        variant: "destructive"
      });
      return false;
    }
    
    if (!routineType) {
      toast({
        title: "Error",
        description: "Por favor selecciona un tipo de rutina",
        variant: "destructive"
      });
      return false;
    }
    
    if (exercises.length === 0) {
      toast({
        title: "Error",
        description: "Por favor añade al menos un ejercicio a la rutina",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }, [routineName, routineType, exercises, toast]);
  
  const saveRoutine = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Usuario no autenticado");
      }

      // 2. Create the routine
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: routineName,
          user_id: user.id,
          type: routineType,
          estimated_duration_minutes: exercises.length * 5, // Simple calculation - 5 min per exercise
        })
        .select()
        .single();

      if (routineError || !routineData) {
        throw new Error(routineError?.message || "Error al crear la rutina");
      }

      // 3. Insert routine exercises
      const routineExercisesData = exercises.map((exercise, index) => ({
        routine_id: routineData.id,
        exercise_id: parseInt(exercise.id),
        exercise_order: index + 1,
        sets: exercise.sets.length,
        reps_min: exercise.sets[0]?.reps_min || 8,
        reps_max: exercise.sets[0]?.reps_max || 12,
        rest_between_sets_seconds: exercise.sets[0]?.rest_seconds || 60
      }));

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercisesData);

      if (exercisesError) {
        throw new Error("Error al guardar los ejercicios: " + exercisesError.message);
      }
      
      toast({
        title: "¡Rutina guardada!",
        description: `La rutina ${routineName} ha sido guardada correctamente`,
        variant: "success"
      });
      
      // Reset form & navigate back to routines list
      resetForm();
      navigate('/workout');
      
    } catch (error: any) {
      console.error("Error saving routine:", error);
      toast({
        title: "Error al guardar",
        description: error.message || "Ha ocurrido un error al guardar la rutina",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [routineName, routineType, exercises, validateForm, resetForm, navigate, toast]);
  
  const value = {
    routineName,
    routineType,
    exercises,
    isSubmitting,
    setRoutineName,
    setRoutineType,
    setExercises,
    addExercises,
    deleteExercise,
    reorderExercises,
    validateForm,
    saveRoutine,
    resetForm,
    loadInitialState
  };
  
  return (
    <RoutineContext.Provider value={value}>
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutine = () => {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
};
