
// Define the Exercise type to be used across all exercise files
export interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
  description?: string;
}
