import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NutritionProgramHeader } from '@/components/nutrition/NutritionProgramHeader';
import { RecipeCard } from '@/components/nutrition/RecipeCard';
import { EditableIngredientItem } from '@/components/nutrition/EditableIngredientItem';
import { useNutritionProgramPage } from '@/hooks/useNutritionProgramPage';
import { Separator } from '@/components/ui/separator';

export const NutritionProgramPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

  const {
    nutritionPlan,
    selectedOptions,
    checkedIngredients,
    ingredientQuantities,
    loading,
    saving,
    handleOptionSelect,
    handleIngredientCheck,
    handleQuantityChange,
    handleSaveMeals
  } = useNutritionProgramPage(selectedDate);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Cargando...</h1>
          <div className="w-9" />
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!nutritionPlan) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Plan de Alimentación</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-muted-foreground">No hay plan de alimentación para esta fecha</p>
          </div>
        </div>
      </div>
    );
  }

  const hasSelectedIngredients = Object.values(checkedIngredients).some(checked => checked);

  const groupIngredientsByRecipe = (ingredients: any[]) => {
    const recipeGroups: Record<string, any[]> = {};
    const individualIngredients: any[] = [];

    ingredients.forEach(ingredient => {
      if (ingredient.recipe_id) {
        if (!recipeGroups[ingredient.recipe_id]) {
          recipeGroups[ingredient.recipe_id] = [];
        }
        recipeGroups[ingredient.recipe_id].push(ingredient);
      } else {
        individualIngredients.push(ingredient);
      }
    });

    console.log('Recipe groups:', recipeGroups);
    console.log('Individual ingredients:', individualIngredients);

    return { recipeGroups, individualIngredients };
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NutritionProgramHeader 
        selectedDate={selectedDate}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="space-y-6 p-4">
          {nutritionPlan.meals?.map((meal) => {
            const selectedOptionIndex = selectedOptions[meal.id] || 0;
            const selectedOption = meal.options?.[selectedOptionIndex];
            
            if (!selectedOption?.ingredients || selectedOption.ingredients.length === 0) {
              return null;
            }

            const { recipeGroups, individualIngredients } = groupIngredientsByRecipe(selectedOption.ingredients);

            return (
              <div key={meal.id} className="space-y-4">
                {/* Meal Header */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
                    {meal.meal_name}
                  </h2>
                  
                  {/* Meal Options */}
                  {meal.options && meal.options.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {meal.options.map((option, optionIndex) => (
                        <Button
                          key={option.id}
                          variant={selectedOptions[meal.id] === optionIndex ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleOptionSelect(meal.id, optionIndex)}
                        >
                          Opción {optionIndex + 1}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recipe Groups */}
                {Object.entries(recipeGroups).map(([recipeId, recipeIngredients]) => {
                  // Try to get recipe name from the first ingredient, fallback to a proper name format
                  const firstIngredient = recipeIngredients[0];
                  let recipeName = firstIngredient?.recipe_name;
                  
                  // If no recipe name, create a meaningful name
                  if (!recipeName || recipeName.trim() === '') {
                    recipeName = `Receta de ${recipeIngredients.length} ingrediente${recipeIngredients.length > 1 ? 's' : ''}`;
                  }
                  
                  const totalCalories = recipeIngredients.reduce((sum, ing) => sum + (ing.calories_per_serving * (ingredientQuantities[ing.id] || ing.quantity_grams) / ing.quantity_grams), 0);
                  const totalProtein = recipeIngredients.reduce((sum, ing) => sum + (ing.protein_g_per_serving * (ingredientQuantities[ing.id] || ing.quantity_grams) / ing.quantity_grams), 0);
                  const totalCarbs = recipeIngredients.reduce((sum, ing) => sum + (ing.carbs_g_per_serving * (ingredientQuantities[ing.id] || ing.quantity_grams) / ing.quantity_grams), 0);
                  const totalFat = recipeIngredients.reduce((sum, ing) => sum + (ing.fats_g_per_serving * (ingredientQuantities[ing.id] || ing.quantity_grams) / ing.quantity_grams), 0);

                  return (
                    <RecipeCard
                      key={recipeId}
                      recipeName={recipeName}
                      totalCalories={totalCalories}
                      totalProtein={totalProtein}
                      totalCarbs={totalCarbs}
                      totalFat={totalFat}
                      ingredients={recipeIngredients}
                      checkedIngredients={checkedIngredients}
                      ingredientQuantities={ingredientQuantities}
                      onIngredientCheck={handleIngredientCheck}
                      onQuantityChange={handleQuantityChange}
                      recipeImageUrl={recipeIngredients[0]?.recipe_image_url}
                      recipeDescription={recipeIngredients[0]?.recipe_description}
                      recipeInstructions={recipeIngredients[0]?.recipe_instructions}
                    />
                  );
                })}

                {/* Individual Ingredients */}
                {individualIngredients.length > 0 && (
                  <div className="space-y-2">
                    {individualIngredients.map((ingredient) => (
                      <EditableIngredientItem
                        key={ingredient.id}
                        ingredient={ingredient}
                        checked={checkedIngredients[ingredient.id] || false}
                        quantity={ingredientQuantities[ingredient.id] || ingredient.quantity_grams}
                        onCheck={(checked) => handleIngredientCheck(ingredient.id, checked)}
                        onQuantityChange={(quantity) => handleQuantityChange(ingredient.id, quantity)}
                      />
                    ))}
                  </div>
                )}

                <Separator />
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Save Button */}
      {hasSelectedIngredients && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button
            onClick={handleSaveMeals}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? "Guardando..." : "Guardar Comidas Seleccionadas"}
          </Button>
        </div>
      )}
    </div>
  );
};