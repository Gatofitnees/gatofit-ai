
import { Exercise } from './exercises/exerciseTypes';
import { forearmExercises } from './exercises/forearmExercises';
import { abdominalExercises } from './exercises/abdominalExercises';
import { cardioExercises } from './exercises/cardioExercises';
import { backExercises } from './exercises/backExercises';

// Export all additional exercises to be imported by useExercises.tsx
export const additionalExercises: Exercise[] = [
  ...forearmExercises,
  ...abdominalExercises,
  ...cardioExercises,
  ...backExercises,
];
