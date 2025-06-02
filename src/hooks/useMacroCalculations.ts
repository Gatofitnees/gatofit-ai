
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/userProfile';
import { calculateAge } from '@/utils/profileUtils';

export interface MacroRecommendations {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export const useMacroCalculations = () => {
  // Function to recalculate macros when relevant data changes
  const recalculateMacros = async (profileData: UserProfile): Promise<MacroRecommendations | null> => {
    if (!profileData.current_weight_kg || !profileData.height_cm || !profileData.date_of_birth) {
      return null;
    }

    const age = calculateAge(profileData.date_of_birth);
    
    try {
      const { data, error } = await supabase.rpc('calculate_macro_recommendations', {
        user_weight_kg: profileData.current_weight_kg,
        user_height_cm: profileData.height_cm,
        user_age: age,
        user_gender: profileData.gender || 'male',
        user_goal: profileData.main_goal || 'maintain_weight',
        user_trainings_per_week: profileData.trainings_per_week || 3,
        user_target_pace: profileData.target_pace || 'moderate'
      });

      if (error) {
        console.error('Error calculating macros:', error);
        return null;
      }

      // Type assertion to ensure the returned data matches our expected structure
      const macroData = data as MacroRecommendations;
      return macroData;
    } catch (error) {
      console.error('Error calling macro calculation function:', error);
      return null;
    }
  };

  return { recalculateMacros };
};
