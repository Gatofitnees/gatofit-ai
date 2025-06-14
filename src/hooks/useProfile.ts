
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
  const { recalculateMacros } = useMacroCalculations();

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
    if (!user) {
      console.error('No user found for profile update');
      return false;
    }

    console.log('Updating profile with:', updates);

    try {
      const dbUpdates = convertProfileToDatabase(updates);
      console.log('Database updates:', dbUpdates);
      
      // First, update the basic profile data
      const { error: updateError } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating basic profile:', updateError);
        throw updateError;
      }

      console.log('Basic profile updated successfully');

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
        console.log('Attempting to recalculate macros...');
        const updatedProfile = { ...profile, ...updates };
        const newMacros = await recalculateMacros(updatedProfile);
        
        if (newMacros) {
          console.log('New macros calculated:', newMacros);
          macroUpdates = {
            initial_recommended_calories: newMacros.calories,
            initial_recommended_protein_g: newMacros.protein_g,
            initial_recommended_carbs_g: newMacros.carbs_g,
            initial_recommended_fats_g: newMacros.fats_g
          };

          // Update macros separately - if this fails, we still have the basic profile saved
          const { error: macroError } = await supabase
            .from('profiles')
            .update(macroUpdates)
            .eq('id', user.id);

          if (macroError) {
            console.error('Error updating macros (but basic profile saved):', macroError);
            // Don't throw error here - basic profile is already saved
          } else {
            console.log('Macros updated successfully');
          }
        } else {
          console.log('Macro calculation returned null, skipping macro update');
        }
      }

      // Update local state with all changes including macros
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
      console.log('Profile update completed successfully');
      
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
