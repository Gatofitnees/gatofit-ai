import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Target, Clock, Users, UtensilsCrossed } from "lucide-react";
import Button from "@/components/Button";
import { useAdminNutritionProgram } from "@/hooks/useAdminNutritionProgram";
import { Card } from "@/components/ui/card";

const AdminNutritionPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { nutritionPlan, loading } = useAdminNutritionProgram(selectedDate);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando plan nutricional...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!nutritionPlan) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/nutrition')}
            className="p-2 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Plan Nutricional</h1>
        </div>
        
        <div className="text-center py-12">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No hay plan nutricional asignado para este día
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/nutrition')}
          className="p-2 mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Plan Nutricional</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {formatDate(selectedDate)}
          </p>
        </div>
      </div>

      {/* Plan Info */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">{nutritionPlan.name}</h2>
        {nutritionPlan.description && (
          <p className="text-muted-foreground text-sm mb-4">
            {nutritionPlan.description}
          </p>
        )}
        
        {/* Targets */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Calorías</p>
              <p className="font-semibold">{nutritionPlan.target_calories} kcal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Proteína</p>
              <p className="font-semibold">{nutritionPlan.target_protein_g}g</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Carbohidratos</p>
              <p className="font-semibold">{nutritionPlan.target_carbs_g}g</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Grasas</p>
              <p className="font-semibold">{nutritionPlan.target_fats_g}g</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Meals */}
      {nutritionPlan.meals && nutritionPlan.meals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Comidas Planificadas</h3>
          <div className="space-y-4">
            {nutritionPlan.meals
              .sort((a, b) => a.meal_order - b.meal_order)
              .map((meal) => (
                <Card key={meal.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">{meal.meal_name}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {meal.meal_type}
                    </span>
                  </div>
                  
                  {meal.target_calories && (
                    <div className="text-sm text-muted-foreground mb-3">
                      <p>Objetivo: {meal.target_calories} kcal</p>
                      {meal.target_protein_g && (
                        <p>Proteína: {meal.target_protein_g}g | Carbos: {meal.target_carbs_g}g | Grasas: {meal.target_fats_g}g</p>
                      )}
                    </div>
                  )}

                  {/* Meal Options */}
                  {meal.options && meal.options.length > 0 && (
                    <div className="space-y-3">
                      {meal.options.map((option) => (
                        <div key={option.id} className="border-l-2 border-primary/20 pl-3">
                          <h5 className="font-medium text-sm">{option.option_name}</h5>
                          {option.description && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {option.description}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {option.total_calories} kcal • {option.total_protein_g}g prot • {option.total_carbs_g}g carbs • {option.total_fats_g}g grasas
                          </div>
                          
                          {/* Ingredients */}
                          {option.ingredients && option.ingredients.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Ingredientes:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {option.ingredients.map((ingredient) => (
                                  <li key={ingredient.id} className="flex justify-between">
                                    <span>{ingredient.custom_food_name}</span>
                                    <span>{ingredient.quantity_grams}g</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Plan nutricional personalizado del programa asignado
        </p>
      </div>
    </div>
  );
};

export default AdminNutritionPlanPage;