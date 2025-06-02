
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
      // Calculate age from birth date
      const age = data.dateOfBirth ? 
        Math.floor((new Date().getTime() - new Date(data.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

      // Convert obstacles and achievements to JSON format
      const obstaclesJson = data.obstacles.length > 0 ? JSON.stringify(data.obstacles) : null;
      const achievementsJson = data.achievements.length > 0 ? JSON.stringify(data.achievements) : null;

      const profileUpdates = {
        gender: data.gender as 'male' | 'female' | null,
        height_cm: data.height,
        current_weight_kg: data.weight,
        body_fat_percentage: data.bodyFatPercentage,
        date_of_birth: data.dateOfBirth, // This is already a string from the onboarding
        trainings_per_week: data.trainingsPerWeek,
        previous_app_experience: data.previousAppExperience,
        main_goal: data.mainGoal,
        target_weight_kg: data.targetWeight,
        target_pace: data.targetPace,
        target_kg_per_week: data.targetKgPerWeek,
        diet_id: data.diet,
        initial_recommended_calories: data.initial_recommended_calories,
        initial_recommended_protein_g: data.initial_recommended_protein_g,
        initial_recommended_carbs_g: data.initial_recommended_carbs_g,
        initial_recommended_fats_g: data.initial_recommended_fats_g,
        unit_system_preference: data.unit_system_preference
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
