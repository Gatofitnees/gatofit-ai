import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkoutCache, WorkoutCacheData } from '../hooks/useWorkoutCache';

interface WorkoutCacheContextType {
  hasCache: boolean;
  cachedWorkout: WorkoutCacheData | null;
  saveWorkoutCache: (
    routineId: number,
    routineName: string,
    startTime: Date,
    baseExercises: Record<number, any>,
    temporaryExercises: any[]
  ) => void;
  loadWorkoutCache: () => WorkoutCacheData | null;
  clearCache: () => void;
  hasCacheForRoutine: (routineId: number) => boolean;
  checkCache: () => WorkoutCacheData | null;
}

const WorkoutCacheContext = createContext<WorkoutCacheContextType | null>(null);

export const WorkoutCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const cacheHook = useWorkoutCache();

  return (
    <WorkoutCacheContext.Provider value={cacheHook}>
      {children}
    </WorkoutCacheContext.Provider>
  );
};

export const useWorkoutCacheContext = () => {
  const context = useContext(WorkoutCacheContext);
  if (!context) {
    throw new Error('useWorkoutCacheContext must be used within WorkoutCacheProvider');
  }
  return context;
};
