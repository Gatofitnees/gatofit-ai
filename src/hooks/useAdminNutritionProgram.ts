import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminNutritionPlan {
  id: string;
  name: string;
  description?: string;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fats_g: number;
  duration_days?: number;
  difficulty_level?: string;
  meals?: AdminNutritionMeal[];
}

export interface AdminNutritionMeal {
  id: string;
  meal_name: string;
  meal_type: string;
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fats_g?: number;
  meal_order: number;
  options?: AdminNutritionMealOption[];
}

export interface AdminNutritionMealOption {
  id: string;
  option_name: string;
  description?: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fats_g: number;
  ingredients?: AdminNutritionIngredient[];
}

export interface AdminNutritionIngredient {
  id: string;
  custom_food_name?: string;
  quantity_grams: number;
  calories_per_serving: number;
  protein_g_per_serving: number;
  carbs_g_per_serving: number;
  fats_g_per_serving: number;
  fiber_g_per_serving: number;
  recipe_id?: string;
  recipe_name?: string;
}

export const useAdminNutritionProgram = (selectedDate: Date) => {
  const { toast } = useToast();
  const [nutritionPlan, setNutritionPlan] = useState<AdminNutritionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasNutritionPlan, setHasNutritionPlan] = useState(false);

  const fetchAdminNutritionPlan = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        return;
      }

      // Verificar si el usuario tiene un programa admin activo
      const { data: adminPrograms, error: adminError } = await supabase
        .from('user_assigned_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (adminError) throw adminError;

      if (!adminPrograms || adminPrograms.length === 0) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        return;
      }

      const adminAssignment = adminPrograms[0];
      
      // Calcular día actual del programa
      const startDate = new Date(adminAssignment.started_at);
      const daysDiff = Math.floor((selectedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        return;
      }

      const weekNumber = Math.floor(daysDiff / 7) + 1;
      const jsDay = selectedDate.getDay();
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // 0=lunes, 6=domingo

      console.log('Admin nutrition plan calculation:', { weekNumber, dayOfWeek, daysDiff });

      // Buscar plan nutricional para este día
      const { data: nutritionPlanData, error: nutritionError } = await supabase
        .from('admin_program_nutrition_plans' as any)
        .select('*')
        .eq('program_id', adminAssignment.program_id)
        .eq('week_number', weekNumber)
        .eq('day_of_week', dayOfWeek)
        .limit(1);

      if (nutritionError) throw nutritionError;

      if (nutritionPlanData && nutritionPlanData.length > 0) {
        const nutritionPlanRef = nutritionPlanData[0];
        
        // Obtener detalles del plan nutricional
        const { data: planDetails, error: planError } = await supabase
          .from('nutrition_plans')
          .select(`
            *,
            meals:nutrition_plan_meals (
              *,
              options:nutrition_plan_meal_options (
                *,
                ingredients:nutrition_plan_meal_ingredients (
                  *,
                  recipe_id,
                  recipe_name
                )
              )
            )
          `)
          .eq('id', (nutritionPlanRef as any).nutrition_plan_id)
          .limit(1);

        if (planError) throw planError;

        if (planDetails && planDetails.length > 0) {
          const planData = planDetails[0];
          setNutritionPlan(planData as any);
          setHasNutritionPlan(true);
          console.log('Admin nutrition plan found:', planData);
        } else {
          setNutritionPlan(null);
          setHasNutritionPlan(false);
        }
      } else {
        // Aún hay programa admin, pero no plan nutricional para este día
        setNutritionPlan(null);
        setHasNutritionPlan(false);
      }

    } catch (error: any) {
      console.error("Error fetching admin nutrition plan:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el plan nutricional",
        variant: "destructive"
      });
      setNutritionPlan(null);
      setHasNutritionPlan(false);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => {
    fetchAdminNutritionPlan();
  }, [fetchAdminNutritionPlan]);

  return {
    nutritionPlan,
    loading,
    hasNutritionPlan,
    refetch: fetchAdminNutritionPlan
  };
};