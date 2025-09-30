import React, { useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NutritionProgramHeader } from '@/components/nutrition/NutritionProgramHeader';
import { RecipeCard } from '@/components/nutrition/RecipeCard';
import { EditableIngredientItem } from '@/components/nutrition/EditableIngredientItem';
import { MealSkeleton, OptionSkeleton, RecipeSkeleton } from '@/components/nutrition/MealSkeleton';
import { useProgressiveNutritionProgram } from '@/hooks/useProgressiveNutritionProgram';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import SaveNutritionMealModal from '@/components/nutrition/SaveNutritionMealModal';
import { useLocalTimezone } from '@/hooks/useLocalTimezone';
import { useToast } from '@/hooks/use-toast';

export const ProgressiveNutritionProgramPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCurrentLocalDate } = useLocalTimezone();
  const { toast } = useToast();
  const dateParam = searchParams.get('date');
  
  // Use user's local current date when no date parameter is provided
  const selectedDate = useMemo(() => {
    if (dateParam) {
      // Create a date object that represents the local date, not UTC
      const [year, month, day] = dateParam.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    // For current date, create a Date object representing today in local timezone
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }, [dateParam]);

  const {
    nutritionPlan,
    selectedOptions,
    checkedIngredients,
    ingredientQuantities,
    loading,
    saving,
    showSaveModal,
    handleOptionSelect,
    handleIngredientCheck,
    handleQuantityChange,
    handleSaveMeals,
    handleOpenSaveModal,
    handleSaveWithName,
    setShowSaveModal,
    getSelectedIngredients,
    // Progressive loading helpers
    isMealLoaded,
    isOptionLoaded,
    isMealLoading,
    isOptionLoading,
    registerMealRef,
    loadMeal
  } = useProgressiveNutritionProgram(selectedDate);

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
        <div className="flex-1 p-4">
          <MealSkeleton />
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

  const hasSelectedIngredients = useMemo(() => 
    Object.values(checkedIngredients).some(checked => checked),
    [checkedIngredients]
  );

  const groupIngredientsByRecipe = useCallback((ingredients: any[]) => {
    const recipeGroups: Record<string, any[]> = {};
    const individualIngredients: any[] = [];

    ingredients.forEach(ingredient => {
      if (ingredient.recipe_id && ingredient.recipe_name && ingredient.recipe_name.trim() !== '') {
        if (!recipeGroups[ingredient.recipe_id]) {
          recipeGroups[ingredient.recipe_id] = [];
        }
        recipeGroups[ingredient.recipe_id].push(ingredient);
      } else {
        individualIngredients.push(ingredient);
      }
    });

    return { recipeGroups, individualIngredients };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NutritionProgramHeader 
        selectedDate={selectedDate}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="space-y-6 p-4">
          {nutritionPlan.meals?.map((meal, mealIndex) => {
            const selectedOptionIndex = selectedOptions[meal.id] || 0;
            const isLoaded = isMealLoaded(meal.id);
            const isLoading = isMealLoading(meal.id);
            
            return (
              <div 
                key={meal.id} 
                id={`meal-${meal.id}`}
                ref={(ref) => registerMealRef(meal.id, ref)}
                className="space-y-4"
              >
                {/* Meal Header - Always visible */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
                    {meal.meal_name}
                  </h2>
                  
                  {/* Meal Options - Show if loaded */}
                  {isLoaded && meal.options && meal.options.length > 1 && (
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex w-max space-x-2 p-1">
                        {meal.options.map((option, optionIndex) => (
                          <Button
                            key={option.id}
                            variant={selectedOptions[meal.id] === optionIndex ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleOptionSelect(meal.id, optionIndex)}
                            className="flex-shrink-0"
                            disabled={isOptionLoading(meal.id, optionIndex)}
                          >
                            {isOptionLoading(meal.id, optionIndex) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              `Opción ${optionIndex + 1}`
                            )}
                          </Button>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  )}
                </div>

                {/* Loading State */}
                {isLoading && <MealSkeleton />}

                {/* Loaded Content */}
                {isLoaded && (() => {
                  const selectedOption = meal.options?.[selectedOptionIndex];
                  const hasIngredients = selectedOption?.ingredients && selectedOption.ingredients.length > 0;
                  const optionLoaded = isOptionLoaded(meal.id, selectedOptionIndex);
                  const optionLoading = isOptionLoading(meal.id, selectedOptionIndex);

                  if (optionLoading) {
                    return <OptionSkeleton />;
                  }

                  if (!hasIngredients || !optionLoaded) {
                    return (
                      <div className="text-center py-8">
                        <div className="bg-muted/50 rounded-lg p-6">
                          <p className="text-muted-foreground">
                            Esta opción no tiene ingredientes configurados
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Selecciona otra opción para ver los ingredientes disponibles
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const { recipeGroups, individualIngredients } = groupIngredientsByRecipe(selectedOption.ingredients);

                  return (
                    <>
                      {/* Recipe Groups */}
                      {Object.entries(recipeGroups).map(([recipeId, recipeIngredients]) => {
                        const firstIngredient = recipeIngredients[0];
                        const recipeName = firstIngredient?.recipe_name || `Receta de ${recipeIngredients.length} ingrediente${recipeIngredients.length > 1 ? 's' : ''}`;
                        
                        // Calculate totals based on current quantities with safety checks
                        const totalCalories = recipeIngredients.reduce((sum, ing) => {
                          const currentQuantity = ingredientQuantities[ing.id] || ing.quantity_grams || 0;
                          const baseQuantity = ing.quantity_grams || 1;
                          const calories = ing.calories_per_serving || 0;
                          const ratio = currentQuantity / baseQuantity;
                          const result = sum + (calories * ratio);
                          return isNaN(result) ? sum : result;
                        }, 0);
                        
                        const totalProtein = recipeIngredients.reduce((sum, ing) => {
                          const currentQuantity = ingredientQuantities[ing.id] || ing.quantity_grams || 0;
                          const baseQuantity = ing.quantity_grams || 1;
                          const protein = ing.protein_g_per_serving || 0;
                          const ratio = currentQuantity / baseQuantity;
                          const result = sum + (protein * ratio);
                          return isNaN(result) ? sum : result;
                        }, 0);
                        
                        const totalCarbs = recipeIngredients.reduce((sum, ing) => {
                          const currentQuantity = ingredientQuantities[ing.id] || ing.quantity_grams || 0;
                          const baseQuantity = ing.quantity_grams || 1;
                          const carbs = ing.carbs_g_per_serving || 0;
                          const ratio = currentQuantity / baseQuantity;
                          const result = sum + (carbs * ratio);
                          return isNaN(result) ? sum : result;
                        }, 0);
                        
                        const totalFat = recipeIngredients.reduce((sum, ing) => {
                          const currentQuantity = ingredientQuantities[ing.id] || ing.quantity_grams || 0;
                          const baseQuantity = ing.quantity_grams || 1;
                          const fats = ing.fats_g_per_serving || 0;
                          const ratio = currentQuantity / baseQuantity;
                          const result = sum + (fats * ratio);
                          return isNaN(result) ? sum : result;
                        }, 0);

                        const handleSaveRecipeIngredients = () => {
                          const selectedRecipeIngredients = recipeIngredients.filter(ingredient => 
                            checkedIngredients[ingredient.id]
                          );
                          
                          if (selectedRecipeIngredients.length > 0) {
                            setShowSaveModal(true);
                          } else {
                            toast({
                              title: "Sin ingredientes seleccionados",
                              description: "Selecciona al menos un ingrediente para guardar.",
                              variant: "destructive"
                            });
                          }
                        };

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
                            onSaveRecipeIngredients={handleSaveRecipeIngredients}
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
                    </>
                  );
                })()}

                {/* Show placeholder for unloaded meals */}
                {!isLoaded && !isLoading && mealIndex > 0 && (
                  <div className="text-center py-8">
                    <div className="bg-muted/30 rounded-lg p-6">
                      <p className="text-muted-foreground text-sm">
                        Desplázate hacia abajo para cargar más comidas
                      </p>
                    </div>
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
            onClick={handleOpenSaveModal}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? "Guardando..." : "Guardar Comidas Seleccionadas"}
          </Button>
        </div>
      )}

      {/* Save Modal */}
      <SaveNutritionMealModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveWithName}
        ingredients={getSelectedIngredients()}
        quantities={ingredientQuantities}
        isSaving={saving}
      />
    </div>
  );
});