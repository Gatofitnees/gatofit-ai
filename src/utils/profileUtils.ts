import { UserProfile } from '@/types/userProfile';

// Helper function to convert database data to UserProfile format
export const convertDatabaseToProfile = (data: any): UserProfile => {
  return {
    ...data,
    // The enum values now match, so no conversion needed
  } as UserProfile;
};

// Helper function to convert UserProfile data to database format
export const convertProfileToDatabase = (updates: Partial<UserProfile>) => {
  const dbUpdates = { ...updates };
  
  // Remove any fields that don't exist in the database schema
  // Only keep fields that are actually in the profiles table
  const allowedFields = [
    'full_name', 'username', 'avatar_url', 'bio', 'is_profile_public',
    'height_cm', 'current_weight_kg', 'body_fat_percentage', 'gender',
    'date_of_birth', 'trainings_per_week', 'previous_app_experience',
    'main_goal', 'target_weight_kg', 'target_pace', 'target_kg_per_week',
    'diet_id', 'initial_recommended_calories', 'initial_recommended_protein_g',
    'initial_recommended_carbs_g', 'initial_recommended_fats_g',
    'unit_system_preference', 'chest_circumference_cm', 'leg_circumference_cm',
    'abdomen_circumference_cm', 'arm_circumference_cm'
  ];
  
  const filteredUpdates: any = {};
  Object.keys(dbUpdates).forEach(key => {
    if (allowedFields.includes(key) && dbUpdates[key as keyof UserProfile] !== undefined) {
      filteredUpdates[key] = dbUpdates[key as keyof UserProfile];
    }
  });
  
  return filteredUpdates;
};

// Function to calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
