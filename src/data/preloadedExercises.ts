
import { Exercise, DifficultyLevel } from '@/features/workout/types';
import { chestExercises } from './exercises/chest';
import { shoulderExercises } from './exercises/shoulderExercises';
import { legExercises } from './exercises/legExercises';
import { armExercises } from './exercises/armExercises';

// Helper function to safely cast exercise arrays
const castExercises = (exercises: any[]): Exercise[] => {
  return exercises as Exercise[];
};

// Combine all exercise arrays
export const preloadedExercises: Exercise[] = [
  ...castExercises(chestExercises),
  ...castExercises(shoulderExercises),
  ...castExercises(legExercises),
  ...castExercises(armExercises),
];
