import { useState, useCallback, useMemo, useRef } from 'react';
import type { WorkoutExercise } from '../types/workout';

export interface WorkoutCacheData {
  routineId: number;
  routineName: string;
  startTime: string; // ISO string
  lastSaved: string; // ISO string
  baseExercises: Record<number, WorkoutExercise>;
  temporaryExercises: any[];
  version: string;
}

const CACHE_KEY = 'gatofit_workout_cache';
const CACHE_VERSION = '1.0';
const MAX_CACHE_AGE_HOURS = 24;

export function useWorkoutCache() {
  const [hasCache, setHasCache] = useState(false);
  const [cachedWorkout, setCachedWorkout] = useState<WorkoutCacheData | null>(null);
  
  // Use refs to track current state without causing dependency cycles
  const hasCacheRef = useRef(hasCache);
  const cachedWorkoutRef = useRef(cachedWorkout);
  
  // Update refs when state changes
  hasCacheRef.current = hasCache;
  cachedWorkoutRef.current = cachedWorkout;

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      setHasCache(false);
      setCachedWorkout(null);
      console.log('🗑️ Workout cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  // Check if cache exists and is valid
  const checkCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        if (hasCacheRef.current || cachedWorkoutRef.current) {
          setHasCache(false);
          setCachedWorkout(null);
        }
        return null;
      }

      const data: WorkoutCacheData = JSON.parse(cached);
      
      // Validate cache age
      const lastSavedTime = new Date(data.lastSaved).getTime();
      const now = Date.now();
      const hoursSinceLastSave = (now - lastSavedTime) / (1000 * 60 * 60);
      
      if (hoursSinceLastSave > MAX_CACHE_AGE_HOURS) {
        console.log('Cache expired, clearing...');
        clearCache();
        return null;
      }

      // Only update state if values have changed
      if (!hasCacheRef.current || JSON.stringify(cachedWorkoutRef.current) !== JSON.stringify(data)) {
        setHasCache(true);
        setCachedWorkout(data);
      }
      return data;
    } catch (error) {
      console.error('Error checking cache:', error);
      clearCache();
      return null;
    }
  }, [clearCache]);

  // Save workout to cache
  const saveWorkoutCache = useCallback((
    routineId: number,
    routineName: string,
    startTime: Date,
    baseExercises: Record<number, WorkoutExercise>,
    temporaryExercises: any[]
  ) => {
    try {
      const cacheData: WorkoutCacheData = {
        routineId,
        routineName,
        startTime: startTime.toISOString(),
        lastSaved: new Date().toISOString(),
        baseExercises,
        temporaryExercises,
        version: CACHE_VERSION
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setHasCache(true);
      setCachedWorkout(cacheData);
      console.log('✅ Workout cached successfully');
    } catch (error) {
      console.error('Error saving workout cache:', error);
    }
  }, []);

  // Load cached workout
  const loadWorkoutCache = useCallback((): WorkoutCacheData | null => {
    return checkCache();
  }, [checkCache]);

  // Check if there's a cache for a specific routine
  const hasCacheForRoutine = useCallback((routineId: number): boolean => {
    const cache = loadWorkoutCache();
    return cache?.routineId === routineId;
  }, [loadWorkoutCache]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    hasCache,
    cachedWorkout,
    saveWorkoutCache,
    loadWorkoutCache,
    clearCache,
    hasCacheForRoutine,
    checkCache
  }), [hasCache, cachedWorkout, saveWorkoutCache, loadWorkoutCache, clearCache, hasCacheForRoutine, checkCache]);
}
