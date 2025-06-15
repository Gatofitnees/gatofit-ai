
import { useMemo } from 'react';
import { FoodLogEntry } from './useFoodLog';
import { Profile } from './useProfile';

export const useNutritionCalculations = (entries: FoodLogEntry[], profile: Profile | null) => {
  const todayTotals = useMemo(() => {
    return entries.reduce(
      (totals, entry) => ({
        calories: totals.calories + entry.calories_consumed,
        protein: totals.protein + entry.protein_g_consumed,
        carbs: totals.carbs + entry.carbs_g_consumed,
        fat: totals.fat + entry.fat_g_consumed
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  const macros = useMemo(() => ({
    calories: {
      current: todayTotals.calories,
      target: profile?.initial_recommended_calories || 2000,
      unit: "kcal"
    },
    protein: {
      current: todayTotals.protein,
      target: profile?.initial_recommended_protein_g || 120
    },
    carbs: {
      current: todayTotals.carbs,
      target: profile?.initial_recommended_carbs_g || 200
    },
    fats: {
      current: todayTotals.fat,
      target: profile?.initial_recommended_fats_g || 65
    }
  }), [todayTotals, profile]);

  const calorieProgress = useMemo(() => {
    if (macros.calories.target === 0) return 0;
    return Math.round((macros.calories.current / macros.calories.target) * 100);
  }, [macros.calories]);

  return { macros, calorieProgress };
};
