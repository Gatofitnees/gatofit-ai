
export interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_profile_public: boolean | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  body_fat_percentage: number | null;
  // Onboarding data fields - updated types to match database exactly
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  date_of_birth: string | null;
  trainings_per_week: number | null;
  previous_app_experience: boolean | null;
  // Fixed enum values to match database
  main_goal: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'gain_muscle' | 'improve_health' | 'increase_strength' | null;
  target_weight_kg: number | null;
  // Fixed enum values to match database
  target_pace: 'sloth' | 'rabbit' | 'leopard' | null;
  target_kg_per_week: number | null;
  diet_id: number | null;
  initial_recommended_calories: number | null;
  initial_recommended_protein_g: number | null;
  initial_recommended_carbs_g: number | null;
  initial_recommended_fats_g: number | null;
  unit_system_preference: 'metric' | 'imperial' | null;
  // Body measurements
  chest_circumference_cm: number | null;
  leg_circumference_cm: number | null;
  abdomen_circumference_cm: number | null;
  arm_circumference_cm: number | null;
}
