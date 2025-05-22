
import { Exercise, DifficultyLevel } from '@/features/workout/types';
import { chestExercises } from './exercises/chest';
import { shoulderExercises } from './exercises/shoulderExercises';
import { legExercises } from './exercises/legExercises';
import { armExercises } from './exercises/armExercises';
import { forearmExercises } from './exercises/forearmExercises';
import { abdominalExercises } from './exercises/abdominalExercises';
import { cardioExercises } from './exercises/cardioExercises';

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
  ...castExercises(forearmExercises),
  ...castExercises(abdominalExercises),
  ...castExercises(cardioExercises),
  // Common exercises that might be missing from the specific categories
  {
    
  }
];
