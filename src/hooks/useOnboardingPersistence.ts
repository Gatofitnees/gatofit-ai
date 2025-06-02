
import { useState, useEffect } from 'react';
import { OnboardingData } from '@/pages/onboarding/OnboardingFlow';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_STORAGE_KEY = 'gatofit_onboarding_data';

export const useOnboardingPersistence = () => {
  const { user } = useAuth();
  const { updateProfile } = useProfile();

  // Load onboarding data from localStorage
  const loadOnboardingData = (): OnboardingData | null => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      return null;
    }
  };

  // Save onboarding data to localStorage
  const saveOnboardingData = (data: OnboardingData) => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  // Clear onboarding data from localStorage
  const clearOnboardingData = () => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
    }
  };

  // Save onboarding data to user profile
  const saveOnboardingToProfile = async (data: OnboardingData): Promise<boolean> => {
    if (!user) return false;

    try {
      // Convert onboarding main goal to database enum values
      const convertMainGoal = (goal: string | null) => {
        if (!goal) return null;
        // Map onboarding values to database values - updated to match current UserProfile type
        const goalMap: { [key: string]: string } = {
          'gain_muscle': 'gain_muscle', // Now both use 'gain_muscle'
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

      const success = await updateProfile(profileUpdates);
      
      if (success) {
        clearOnboardingData();
        console.log('Onboarding data saved to profile successfully');
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
