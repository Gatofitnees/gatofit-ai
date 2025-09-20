-- Add RLS policies for recipes used in nutrition programs
-- Allow users to view recipes that are used in their assigned nutrition plans
CREATE POLICY "Users can view recipes in their nutrition plans" 
ON recipes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM nutrition_plan_meal_ingredients npmi
    JOIN nutrition_plan_meal_options npmo ON npmi.meal_option_id = npmo.id
    JOIN nutrition_plan_meals npm ON npmo.meal_id = npm.id
    JOIN nutrition_plans np ON npm.plan_id = np.id
    JOIN admin_program_nutrition_plans apnp ON np.id = apnp.nutrition_plan_id
    JOIN user_assigned_programs uap ON apnp.program_id = uap.program_id
    WHERE npmi.recipe_id = recipes.id 
    AND uap.user_id = auth.uid() 
    AND uap.is_active = true
    AND np.is_active = true
  )
);

-- Allow users to view recipe ingredients for recipes in their nutrition plans
CREATE POLICY "Users can view recipe ingredients in their nutrition plans" 
ON recipe_ingredients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM nutrition_plan_meal_ingredients npmi
    JOIN nutrition_plan_meal_options npmo ON npmi.meal_option_id = npmo.id
    JOIN nutrition_plan_meals npm ON npmo.meal_id = npm.id
    JOIN nutrition_plans np ON npm.plan_id = np.id
    JOIN admin_program_nutrition_plans apnp ON np.id = apnp.nutrition_plan_id
    JOIN user_assigned_programs uap ON apnp.program_id = uap.program_id
    WHERE npmi.recipe_id = recipe_ingredients.recipe_id 
    AND uap.user_id = auth.uid() 
    AND uap.is_active = true
    AND np.is_active = true
  )
);