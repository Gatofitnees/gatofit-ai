
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

// Helper function to normalize Spanish difficulty levels to English enum values
export function normalizeDifficulty(level: string): DifficultyLevel {
  if (!level) return 'beginner';
  
  const lowercaseLevel = level.toLowerCase();
  
  if (lowercaseLevel === 'principiante') return 'beginner';
  if (lowercaseLevel === 'intermedio') return 'intermediate';
  if (lowercaseLevel === 'avanzado') return 'advanced';
  
  if (lowercaseLevel === 'beginner' || lowercaseLevel === 'intermediate' || lowercaseLevel === 'advanced') {
    return lowercaseLevel as DifficultyLevel;
  }
  
  return 'beginner'; // Default fallback
}
