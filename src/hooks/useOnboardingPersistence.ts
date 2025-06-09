
import { useState, useEffect } from 'react';
import { OnboardingData } from '@/pages/onboarding/OnboardingFlow';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_STORAGE_KEY = 'gatofit_onboarding_data';

export const useOnboardingPersistence = () => {
  const { user } = useAuth();
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

  const saveOnboardingToProfile = async (data: OnboardingData): Promise<boolean> => {
    if (!user) {
      console.error('No user found when trying to save onboarding data');
      return false;
    }

    try {
      console.log('Starting to save onboarding data to profile:', data);

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
        clearOnboardingData();
        console.log('Onboarding data successfully saved to profile and cleared from localStorage');
      } else {
        console.error('Failed to save onboarding data to profile');
      }
      
      return success;
    } catch (error) {
      console.error('Error saving onboarding data to profile:', error);
      return false;
    }
  };

  return {
    loadOnboardingData,
    saveOnboardingData,
    clearOnboardingData,
    saveOnboardingToProfile
  };
};
