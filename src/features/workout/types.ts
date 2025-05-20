
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
}
