
import { useState, useEffect } from 'react';
import { OnboardingData } from '@/pages/onboarding/OnboardingFlow';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_STORAGE_KEY = 'gatofit_onboarding_data';

export const useOnboardingPersistence = () => {
  const { user, loading: authLoading } = useAuth();
  const { updateProfile } = useProfile();

  const loadOnboardingData = (): OnboardingData | null => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      return null;
    }
  };

  const saveOnboardingData = (data: OnboardingData) => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
      console.log('Onboarding data saved to localStorage:', data);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const clearOnboardingData = () => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      console.log('Onboarding data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
    }
  };

  const getCurrentUser = async (): Promise<any> => {
    try {
      // First try to get user from Supabase directly
      const { data: { user: directUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting user from Supabase:', error);
        return null;
      }

      if (directUser) {
        console.log('Got user directly from Supabase:', directUser.id);
        return directUser;
      }

      // Fallback to context user
      if (user) {
        console.log('Using user from context:', user.id);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  };

  const validateUserForSaving = async (): Promise<{ isValid: boolean; user: any }> => {
    console.log('Validating user for saving...');
    
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      console.log('No user found for validation');
      return { isValid: false, user: null };
    }
    
    if (!currentUser.id) {
      console.error('User ID is missing, cannot save onboarding data');
      return { isValid: false, user: null };
    }
    
    console.log('User validation successful:', currentUser.id);
    return { isValid: true, user: currentUser };
  };

  const saveOnboardingToProfile = async (data: OnboardingData): Promise<boolean> => {
    console.log('Starting to save onboarding data to profile:', data);
    
    // Wait for user with retry logic
    let retryCount = 0;
    const maxRetries = 3; // Reduced retries for faster feedback
    let validationResult = { isValid: false, user: null };

    while (retryCount < maxRetries && !validationResult.isValid) {
      console.log(`Validation attempt ${retryCount + 1}/${maxRetries}`);
      validationResult = await validateUserForSaving();
      
      if (!validationResult.isValid) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Waiting 500ms before retry ${retryCount + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    if (!validationResult.isValid) {
      console.error(`Failed to validate user after ${maxRetries} attempts`);
      return false;
    }

    const authenticatedUser = validationResult.user;

    try {
      console.log('User validated, proceeding with profile update:', authenticatedUser.id);

      const convertMainGoal = (goal: string | null) => {
        if (!goal) return null;
        const goalMap: { [key: string]: string } = {
          'gain_muscle': 'gain_muscle',
          'lose_weight': 'lose_weight',
          'maintain_weight': 'maintain_weight',
          'improve_health': 'improve_health',
          'increase_strength': 'increase_strength'
        };
        return goalMap[goal] || goal;
      };

      const profileUpdates = {
        gender: data.gender as 'male' | 'female' | null,
        height_cm: data.height,
        current_weight_kg: data.weight,
        body_fat_percentage: data.bodyFatPercentage,
        date_of_birth: typeof data.dateOfBirth === 'string' ? data.dateOfBirth : data.dateOfBirth?.toISOString().split('T')[0],
        trainings_per_week: data.trainingsPerWeek,
        previous_app_experience: data.previousAppExperience,
        main_goal: convertMainGoal(data.mainGoal) as 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'gain_muscle' | 'improve_health' | 'increase_strength' | null,
        target_weight_kg: data.targetWeight,
        target_pace: data.targetPace as 'sloth' | 'rabbit' | 'leopard' | null,
        target_kg_per_week: data.targetKgPerWeek,
        diet_id: data.diet,
        initial_recommended_calories: data.initial_recommended_calories,
        initial_recommended_protein_g: data.initial_recommended_protein_g,
        initial_recommended_carbs_g: data.initial_recommended_carbs_g,
        initial_recommended_fats_g: data.initial_recommended_fats_g,
        unit_system_preference: data.unit_system_preference as 'metric' | 'imperial' | null
      };

      console.log('Profile updates to be saved:', profileUpdates);

      const success = await updateProfile(profileUpdates);
      
      if (success) {
        console.log('Onboarding data successfully saved to profile');
        // Only clear data after successful save
        clearOnboardingData();
        return true;
      } else {
        console.error('Failed to save onboarding data to profile - updateProfile returned false');
        // Don't clear localStorage if save failed, so user can retry
        return false;
      }
      
    } catch (error) {
      console.error('Error saving onboarding data to profile:', error);
      // Don't clear localStorage if there was an error
      return false;
    }
  };

  const waitForUserAuthentication = async (maxWaitTime = 10000): Promise<boolean> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const validationResult = await validateUserForSaving();
      if (validationResult.isValid) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 250)); // Check more frequently
    }
    
    return false;
  };

  return {
    loadOnboardingData,
    saveOnboardingData,
    clearOnboardingData,
    saveOnboardingToProfile,
    waitForUserAuthentication,
    validateUserForSaving
  };
};
