
import { Exercise } from '@/features/workout/types';
import { forearmExercises } from './exercises/forearmExercises';
import { abdominalExercises } from './exercises/abdominalExercises';
import { cardioExercises } from './exercises/cardioExercises';
import { backExercises } from './exercises/backExercises';

// Export all additional exercises to be imported by useExercises.tsx
export const additionalExercises: Exercise[] = [
  ...forearmExercises as Exercise[],
  ...abdominalExercises as Exercise[],
  ...cardioExercises as Exercise[],
  ...backExercises as Exercise[],
];
