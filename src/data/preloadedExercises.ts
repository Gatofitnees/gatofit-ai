
import { Exercise } from './exercises/exerciseTypes';
import { chestExercises } from './exercises/chest';
import { shoulderExercises } from './exercises/shoulderExercises';
import { legExercises } from './exercises/legExercises';
import { armExercises } from './exercises/armExercises';
import { forearmExercises } from './exercises/forearmExercises';
import { abdominalExercises } from './exercises/abdominalExercises';
import { cardioExercises } from './exercises/cardioExercises';

// Combine all exercise arrays
export const preloadedExercises: Exercise[] = [
  ...chestExercises,
  ...shoulderExercises,
  ...legExercises,
  ...armExercises,
];
