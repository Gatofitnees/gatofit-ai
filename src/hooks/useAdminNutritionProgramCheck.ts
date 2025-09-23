import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight hook to only check if a nutrition plan exists for a date
 * without loading all the heavy data. Used for showing/hiding the button.
 */
export const useAdminNutritionProgramCheck = (selectedDate: Date) => {
  const [hasNutritionPlan, setHasNutritionPlan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);

  const checkNutritionPlan = useCallback(async (dateToFetch: Date) => {
    const normalizedDate = new Date(dateToFetch.getFullYear(), dateToFetch.getMonth(), dateToFetch.getDate());
    const dateString = normalizedDate.toISOString().split('T')[0];
    
    // Skip if already checked for this date
    if (lastFetchedDate === dateString) {
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
        return;
      }

      // Check if user has an active admin program
      const { data: adminPrograms, error: adminError } = await supabase
        .from('user_assigned_programs')
        .select('program_id, started_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (adminError || !adminPrograms || adminPrograms.length === 0) {
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
        return;
      }

      const adminAssignment = adminPrograms[0];
      
      // Calculate program day
      const startDate = new Date(adminAssignment.started_at);
      const startDateNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const daysDiff = Math.floor((normalizedDate.getTime() - startDateNormalized.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) {
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
        return;
      }

      const weekNumber = Math.floor(daysDiff / 7) + 1;
      const jsDay = normalizedDate.getDay();
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

      // Just check if nutrition plan exists (no data loading)
      const { data: nutritionPlanData, error: nutritionError } = await supabase
        .from('admin_program_nutrition_plans' as any)
        .select('nutrition_plan_id')
        .eq('program_id', adminAssignment.program_id)
        .eq('week_number', weekNumber)
        .eq('day_of_week', dayOfWeek)
        .limit(1);

      if (nutritionError) {
        console.error('Error checking nutrition plan:', nutritionError);
        setHasNutritionPlan(false);
      } else {
        setHasNutritionPlan(nutritionPlanData && nutritionPlanData.length > 0);
      }
      
      setLastFetchedDate(dateString);

    } catch (error) {
      console.error("Error checking admin nutrition plan:", error);
      setHasNutritionPlan(false);
      setLastFetchedDate(dateString);
    } finally {
      setLoading(false);
    }
  }, [lastFetchedDate]);

  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    if (lastFetchedDate !== dateString) {
      checkNutritionPlan(selectedDate);
    }
  }, [selectedDate.toISOString().split('T')[0], checkNutritionPlan]);

  return {
    hasNutritionPlan,
    loading
  };
};