
import { DifficultyLevel } from '@/features/workout/types';

// Define the Exercise type to be used across all exercise files
export interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: DifficultyLevel;
  video_url?: string;
  description?: string;
}

// Define the exercise history type
export interface ExerciseHistory {
  id: number;
  exercise_id: number;
  date: Date | string;
  weight_kg: number;
  reps: number;
  sets: number;
  notes?: string;
  user_id: string;
}
