
export interface ExerciseItem {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
}

export interface ExerciseSet {
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

export interface RoutineExercise extends ExerciseItem {
  sets: ExerciseSet[];
}

// Fixed the error in the sync service by explicitly defining the difficulty level type
export interface Exercise extends ExerciseItem {
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  video_url?: string;
  description?: string;
}
