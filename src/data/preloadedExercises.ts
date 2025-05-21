
import { Exercise } from '@/features/workout/types';
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
  ...forearmExercises,
  ...abdominalExercises,
  ...cardioExercises,
  // Common exercises that might be missing from the specific categories
  {
    id: 10001,
    name: "Burpees",
    muscle_group_main: "Full Body",
    equipment_required: "None",
    difficulty_level: "intermediate"
  },
  {
    id: 10002,
    name: "Mountain climbers",
    muscle_group_main: "Full Body",
    equipment_required: "None",
    difficulty_level: "beginner"
  },
  {
    id: 10003,
    name: "Jumping jacks",
    muscle_group_main: "Cardio",
    equipment_required: "None",
    difficulty_level: "beginner"
  },
  {
    id: 10004,
    name: "High knees",
    muscle_group_main: "Cardio",
    equipment_required: "None",
    difficulty_level: "beginner"
  },
  {
    id: 10005,
    name: "Jumping rope",
    muscle_group_main: "Cardio",
    equipment_required: "Rope",
    difficulty_level: "beginner"
  },
  {
    id: 10006,
    name: "Sprints",
    muscle_group_main: "Cardio",
    equipment_required: "None",
    difficulty_level: "advanced"
  },
  {
    id: 10007,
    name: "Sentadilla",
    muscle_group_main: "Legs",
    equipment_required: "Barbell",
    difficulty_level: "intermediate"
  },
  {
    id: 10008,
    name: "Peso muerto",
    muscle_group_main: "Back",
    equipment_required: "Barbell",
    difficulty_level: "advanced"
  },
  {
    id: 10009,
    name: "Dominadas",
    muscle_group_main: "Back",
    equipment_required: "Pull-up Bar",
    difficulty_level: "intermediate"
  },
  {
    id: 10010,
    name: "Abdominal crunch",
    muscle_group_main: "Abs",
    equipment_required: "None",
    difficulty_level: "beginner"
  }
];
