
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
      // Convert database enum values to UserProfile enum values if needed
      main_goal: data.main_goal === 'gain_muscle' ? 'build_muscle' : data.main_goal,
    } as UserProfile;
  };

  // Helper function to convert UserProfile data to database format
  const convertProfileToDatabase = (updates: Partial<UserProfile>) => {
    const dbUpdates = { ...updates };
    // Convert UserProfile enum values to database enum values if needed
    if (dbUpdates.main_goal === 'build_muscle') {
      dbUpdates.main_goal = 'gain_muscle' as any;
    }
    return dbUpdates;
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
      
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente"
      });
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
