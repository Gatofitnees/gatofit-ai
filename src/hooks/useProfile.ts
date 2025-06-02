
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

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
  main_goal: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle' | 'improve_health' | 'increase_strength' | null;
  target_weight_kg: number | null;
  target_pace: 'slow' | 'moderate' | 'fast' | null;
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

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to convert database data to UserProfile format
  const convertDatabaseToProfile = (data: any): UserProfile => {
    return {
      ...data,
      // The enum values now match, so no conversion needed
    } as UserProfile;
  };

  // Helper function to convert UserProfile data to database format
  const convertProfileToDatabase = (updates: Partial<UserProfile>) => {
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
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Function to recalculate macros when relevant data changes
  const recalculateMacros = async (profileData: UserProfile): Promise<{ calories: number; protein_g: number; carbs_g: number; fats_g: number; } | null> => {
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
      const macroData = data as { calories: number; protein_g: number; carbs_g: number; fats_g: number; };
      return macroData;
    } catch (error) {
      console.error('Error calling macro calculation function:', error);
      return null;
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(convertDatabaseToProfile(data));
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;

    try {
      const dbUpdates = convertProfileToDatabase(updates);
      
      // Check if we need to recalculate macros
      const shouldRecalculateMacros = [
        'current_weight_kg', 'height_cm', 'date_of_birth', 'gender',
        'main_goal', 'trainings_per_week', 'target_pace'
      ].some(field => field in dbUpdates);

      let macroUpdates = {};
      
      if (shouldRecalculateMacros && profile) {
        const updatedProfile = { ...profile, ...updates };
        const newMacros = await recalculateMacros(updatedProfile);
        
        if (newMacros) {
          macroUpdates = {
            initial_recommended_calories: newMacros.calories,
            initial_recommended_protein_g: newMacros.protein_g,
            initial_recommended_carbs_g: newMacros.carbs_g,
            initial_recommended_fats_g: newMacros.fats_g
          };
        }
      }

      const finalUpdates = { ...dbUpdates, ...macroUpdates };
      
      const { error } = await supabase
        .from('profiles')
        .update(finalUpdates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates, ...macroUpdates } : null);
      
      if (shouldRecalculateMacros) {
        toast({
          title: "Éxito",
          description: "Perfil y recomendaciones nutricionales actualizados correctamente"
        });
      } else {
        toast({
          title: "Éxito",
          description: "Perfil actualizado correctamente"
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive"
      });
      return false;
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username) return false;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .neq('id', user?.id || '');

      if (error) throw error;
      return data.length === 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    checkUsernameAvailability,
    refetch: fetchProfile
  };
};
