
export interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
}

export interface RoutineFormData {
  name: string;
  type: string;
  description?: string;
}
