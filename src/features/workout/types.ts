
export interface ExerciseItem {
  id: string;
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

export interface RoutineData {
  id: number;
  name: string;
  type: string;
  user_id: string;
  created_at: string;
  estimated_duration_minutes: number;
  description?: string;
  exercise_count?: number;
}

export interface WorkoutSet {
  weight_kg: number;
  reps_completed: number;
  set_number: number;
  completed: boolean;
}

export interface WorkoutExercise extends RoutineExercise {
  workout_sets: WorkoutSet[];
  completed: boolean;
}

export interface WorkoutSession {
  id?: string;
  routine_id: number;
  routine_name: string;
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
  exercises: WorkoutExercise[];
}
