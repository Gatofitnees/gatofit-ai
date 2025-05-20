
import { Exercise } from './exercises/exerciseTypes';
import { forearmExercises } from './exercises/forearmExercises';
import { abdominalExercises } from './exercises/abdominalExercises';
import { cardioExercises } from './exercises/cardioExercises';

// Export all additional exercises to be imported by useExercises.tsx
export const additionalExercises: Exercise[] = [
  ...forearmExercises,
  ...abdominalExercises,
  ...cardioExercises,
];
