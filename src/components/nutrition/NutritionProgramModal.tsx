import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useNutritionProgramModal } from '@/hooks/useNutritionProgramModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NutritionProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export const NutritionProgramModal: React.FC<NutritionProgramModalProps> = ({
  isOpen,
  onClose,
  selectedDate
}) => {
  const {
    nutritionPlan,
    selectedOptions,
    checkedIngredients,
    loading,
    saving,
    handleOptionSelect,
    handleIngredientCheck,
    handleSaveMeals
  } = useNutritionProgramModal(selectedDate, onClose);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!nutritionPlan) {
    return null;
  }

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM yyyy", { locale: es });
  };

  const handleSave = async () => {
    await handleSaveMeals();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Nutrición Programada - {formatDate(selectedDate)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {nutritionPlan.meals?.map((meal) => (
            <div key={meal.id} className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {meal.meal_name}
              </h3>

              {/* Meal Options */}
              {meal.options && meal.options.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Opciones:</p>
                  <div className="flex flex-wrap gap-2">
                    {meal.options.map((option, optionIndex) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(meal.id, optionIndex)}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg border transition-colors",
                          selectedOptions[meal.id] === optionIndex
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:bg-accent"
                        )}
                      >
                        Opción {optionIndex + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients Table */}
              {meal.options && meal.options.length > 0 && (
                (() => {
                  const selectedOption = meal.options[selectedOptions[meal.id] || 0];
                  if (!selectedOption?.ingredients || selectedOption.ingredients.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        No hay ingredientes para esta opción.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ingredientes:</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-border rounded-lg">
                          <thead>
                            <tr className="bg-muted">
                              <th className="text-left p-3 border-b border-border">
                                <span className="sr-only">Completado</span>
                              </th>
                              <th className="text-left p-3 border-b border-border text-sm font-medium">
                                Cantidad
                              </th>
                              <th className="text-left p-3 border-b border-border text-sm font-medium">
                                Alimento
                              </th>
                              <th className="text-left p-3 border-b border-border text-sm font-medium">
                                Calorías
                              </th>
                              <th className="text-left p-3 border-b border-border text-sm font-medium">
                                Proteínas
                              </th>
                              <th className="text-left p-3 border-b border-border text-sm font-medium">
                                Carbohidratos
                              </th>
                              <th className="text-left p-3 border-b border-border text-sm font-medium">
                                Grasas
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOption.ingredients.map((ingredient) => (
                              <tr key={ingredient.id} className="border-b border-border">
                                <td className="p-3">
                                  <Checkbox
                                    checked={checkedIngredients[ingredient.id] || false}
                                    onCheckedChange={(checked) => 
                                      handleIngredientCheck(ingredient.id, !!checked)
                                    }
                                  />
                                </td>
                                <td className="p-3 text-sm">
                                  {ingredient.quantity_grams}g
                                </td>
                                <td className="p-3 text-sm font-medium">
                                  {ingredient.custom_food_name || 'Alimento sin nombre'}
                                </td>
                                <td className="p-3 text-sm">
                                  {ingredient.calories_per_serving.toFixed(2)} kcal
                                </td>
                                <td className="p-3 text-sm">
                                  {ingredient.protein_g_per_serving.toFixed(1)}g
                                </td>
                                <td className="p-3 text-sm">
                                  {ingredient.carbs_g_per_serving.toFixed(1)}g
                                </td>
                                <td className="p-3 text-sm">
                                  {ingredient.fats_g_per_serving.toFixed(1)}g
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar Comidas"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};