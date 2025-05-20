
import { Exercise } from '../exerciseTypes';
import { chestBarbellExercises } from './chestBarbellExercises';
import { chestDumbbellExercises } from './chestDumbbellExercises';
import { chestMachineExercises } from './chestMachineExercises';
import { chestCableExercises } from './chestCableExercises';
import { chestBodyweightExercises } from './chestBodyweightExercises';

// Export all chest exercises
export const chestExercises: Exercise[] = [
  ...chestBarbellExercises,
  ...chestDumbbellExercises,
  ...chestMachineExercises,
  ...chestCableExercises,
  ...chestBodyweightExercises,
];
