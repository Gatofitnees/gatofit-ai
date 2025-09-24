import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Lightweight hook just for checking if a nutrition plan exists
export const useNutritionPlanCheck = (selectedDate: Date) => {
  const [hasNutritionPlan, setHasNutritionPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastCheckedDate, setLastCheckedDate] = useState<string | null>(null);

  const checkNutritionPlanExists = useCallback(async (dateToCheck: Date) => {
    const normalizedDate = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate());
    const dateString = normalizedDate.toISOString().split('T')[0];
    
    // Avoid duplicate checks for the same date
    if (lastCheckedDate === dateString) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasNutritionPlan(false);
        setLastCheckedDate(dateString);
        return;
      }

      // Check if user has an active admin program (lightweight query)
      const { data: adminPrograms } = await supabase
        .from('user_assigned_programs')
        .select('program_id, started_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (!adminPrograms || adminPrograms.length === 0) {
        setHasNutritionPlan(false);
        setLastCheckedDate(dateString);
        return;
      }

      const adminAssignment = adminPrograms[0];
      
      // Calculate program day (lightweight calculation)
      const startDate = new Date(adminAssignment.started_at);
      const startDateNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const daysDiff = Math.floor((normalizedDate.getTime() - startDateNormalized.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) {
        setHasNutritionPlan(false);
        setLastCheckedDate(dateString);
        return;
      }

      const weekNumber = Math.floor(daysDiff / 7) + 1;
      const jsDay = normalizedDate.getDay();
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

      // Quick check if nutrition plan exists for this day (no detailed data)
      const { data: nutritionPlanData } = await supabase
        .from('admin_program_nutrition_plans')
        .select('nutrition_plan_id')
        .eq('program_id', adminAssignment.program_id)
        .eq('week_number', weekNumber)
        .eq('day_of_week', dayOfWeek)
        .limit(1);

      setHasNutritionPlan(!!(nutritionPlanData && nutritionPlanData.length > 0));
      setLastCheckedDate(dateString);

    } catch (error) {
      console.error("Error checking nutrition plan existence:", error);
      setHasNutritionPlan(false);
      setLastCheckedDate(dateString);
    } finally {
      setLoading(false);
    }
  }, [lastCheckedDate]);

  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    if (lastCheckedDate !== dateString) {
      checkNutritionPlanExists(selectedDate);
    }
  }, [selectedDate.toISOString().split('T')[0], checkNutritionPlanExists]);

  return {
    hasNutritionPlan,
    loading
  };
};