
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
      // Convert frontend pace values to database values for the RPC call
      let dbTargetPace = 'rabbit'; // default to moderate
      if (profileData.target_pace === 'sloth') dbTargetPace = 'slow';
      else if (profileData.target_pace === 'rabbit') dbTargetPace = 'moderate';
      else if (profileData.target_pace === 'leopard') dbTargetPace = 'fast';

      // Convert frontend goal values to database values for the RPC call
      let dbGoal = 'maintain_weight'; // default
      if (profileData.main_goal === 'gain_muscle') dbGoal = 'build_muscle';
      else if (profileData.main_goal) dbGoal = profileData.main_goal;

      console.log('Calling macro calculation with:', {
        weight: profileData.current_weight_kg,
        height: profileData.height_cm,
        age,
        gender: profileData.gender || 'male',
        goal: dbGoal,
        trainings: profileData.trainings_per_week || 3,
        pace: dbTargetPace
      });

      const { data, error } = await supabase.rpc('calculate_macro_recommendations', {
        user_weight_kg: profileData.current_weight_kg,
        user_height_cm: profileData.height_cm,
        user_age: age,
        user_gender: profileData.gender || 'male',
        user_goal: dbGoal,
        user_trainings_per_week: profileData.trainings_per_week || 3,
        user_target_pace: dbTargetPace
      });

      if (error) {
        console.error('Error calculating macros:', error);
        return null;
      }

      console.log('Macro calculation result:', data);

      // Type assertion with proper conversion to handle Json type
      const macroData = data as unknown as MacroRecommendations;
      return macroData;
    } catch (error) {
      console.error('Error calling macro calculation function:', error);
      return null;
    }
  };

  return { recalculateMacros };
};
