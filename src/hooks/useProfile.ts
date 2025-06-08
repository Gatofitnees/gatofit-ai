
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/types/userProfile';
import { convertDatabaseToProfile, convertProfileToDatabase } from '@/utils/profileUtils';
import { useMacroCalculations } from '@/hooks/useMacroCalculations';

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { recalculateMacros } = useMacroCalculations();

  const fetchProfile = async (forceRefresh = false) => {
    if (!user) return;
    
    // Avoid unnecessary refetches (cache for 30 seconds)
    const now = Date.now();
    if (!forceRefresh && profile && (now - lastFetchTime) < 30000) {
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const convertedProfile = convertDatabaseToProfile(data);
      setProfile(convertedProfile);
      setLastFetchTime(now);
      
      console.log('Profile fetched successfully:', convertedProfile);
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
    if (!user || updating) return false;

    try {
      setUpdating(true);
      console.log('Updating profile with:', updates);
      
      const dbUpdates = convertProfileToDatabase(updates);
      
      // Check if we need to recalculate macros
      const shouldRecalculateMacros = [
        'current_weight_kg', 'height_cm', 'date_of_birth', 'gender',
        'main_goal', 'trainings_per_week', 'target_pace'
      ].some(field => field in dbUpdates);

      let macroUpdates: {
        initial_recommended_calories?: number;
        initial_recommended_protein_g?: number;
        initial_recommended_carbs_g?: number;
        initial_recommended_fats_g?: number;
      } = {};
      
      if (shouldRecalculateMacros && profile) {
        console.log('Recalculating macros for profile update...');
        const updatedProfile = { ...profile, ...updates };
        const newMacros = await recalculateMacros(updatedProfile);
        
        if (newMacros) {
          macroUpdates = {
            initial_recommended_calories: newMacros.calories,
            initial_recommended_protein_g: newMacros.protein_g,
            initial_recommended_carbs_g: newMacros.carbs_g,
            initial_recommended_fats_g: newMacros.fats_g
          };
          console.log('New macro recommendations:', newMacros);
        }
      }

      const finalUpdates = { ...dbUpdates, ...macroUpdates };
      
      const { error } = await supabase
        .from('profiles')
        .update(finalUpdates)
        .eq('id', user.id);

      if (error) throw error;

      // Immediately update local state with all changes including macros
      const updatedLocalProfile = { 
        ...profile, 
        ...updates, 
        ...(macroUpdates.initial_recommended_calories && {
          initial_recommended_calories: macroUpdates.initial_recommended_calories,
          initial_recommended_protein_g: macroUpdates.initial_recommended_protein_g,
          initial_recommended_carbs_g: macroUpdates.initial_recommended_carbs_g,
          initial_recommended_fats_g: macroUpdates.initial_recommended_fats_g
        })
      };
      
      setProfile(updatedLocalProfile);
      setLastFetchTime(Date.now());
      
      console.log('Profile updated successfully:', updatedLocalProfile);
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(false);
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

  // Enhanced refresh function with better error handling
  const refreshProfile = async () => {
    console.log('Refreshing profile data...');
    await fetchProfile(true);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  return {
    profile,
    loading,
    updating,
    updateProfile,
    checkUsernameAvailability,
    refetch: refreshProfile
  };
};
