
import React, { useState } from "react";
import { Camera, Plus, Utensils } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "../components/Card";
import Button from "../components/Button";
import ProgressRing from "../components/ProgressRing";
import MacroProgress from "../components/MacroProgress";

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const NutritionPage: React.FC = () => {
  // Mock data
  const macros = {
    calories: { current: 1450, target: 2000, unit: "kcal" },
    protein: { current: 90, target: 120 },
    carbs: { current: 130, target: 200 },
    fats: { current: 35, target: 65 }
  };
  
  const calorieProgress = Math.round((macros.calories.current / macros.calories.target) * 100);
  
  const meals: Meal[] = [
    {
      id: "1",
      name: "Desayuno",
      time: "08:30",
      calories: 450,
      protein: 25,
      carbs: 45,
      fat: 15
    },
    {
      id: "2",
      name: "Almuerzo",
      time: "13:15",
      calories: 650,
      protein: 40,
      carbs: 55,
      fat: 12
    },
    {
      id: "3",
      name: "Snack",
      time: "16:30",
      calories: 200,
      protein: 10,
      carbs: 20,
      fat: 5
    }
  ];

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Nutrición</h1>
      
      {/* Calories Summary */}
      <div className="flex items-center justify-center mb-8 animate-fade-in">
        <div className="relative flex items-center justify-center">
          <ProgressRing progress={calorieProgress} size={130} strokeWidth={8} className="text-primary" />
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{macros.calories.current}</span>
            <span className="text-xs text-muted-foreground">/ {macros.calories.target}</span>
            <span className="text-xs mt-1">kcal</span>
          </div>
        </div>
      </div>
      
      {/* Macros Summary */}
      <Card className="mb-6">
        <CardHeader 
          title="Macronutrientes" 
          subtitle="Resumen diario" 
        />
        <CardBody>
          <div className="space-y-4">
            <MacroProgress 
              label="Proteínas" 
              current={macros.protein.current} 
              target={macros.protein.target}
              color="protein" 
            />
            <MacroProgress 
              label="Carbohidratos" 
              current={macros.carbs.current} 
              target={macros.carbs.target}
              color="carbs" 
            />
            <MacroProgress 
              label="Grasas" 
              current={macros.fats.current} 
              target={macros.fats.target}
              color="fat" 
            />
          </div>
        </CardBody>
      </Card>
      
      {/* Meals */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Comidas de Hoy</h2>
          <Button 
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Añadir
          </Button>
        </div>
        
        <div className="space-y-4">
          {meals.map((meal) => (
            <Card key={meal.id}>
              <CardBody>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Utensils className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{meal.name}</h3>
                      <span className="text-xs text-muted-foreground">{meal.time}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {meal.calories} kcal
                      </span>
                      <span className="text-xs text-muted-foreground">
                        P: {meal.protein}g
                      </span>
                      <span className="text-xs text-muted-foreground">
                        C: {meal.carbs}g
                      </span>
                      <span className="text-xs text-muted-foreground">
                        G: {meal.fat}g
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Add Food Button */}
      <div className="fixed bottom-24 right-4 animate-fade-in">
        <Button 
          className="h-14 w-14 rounded-full shadow-neu-button"
          leftIcon={<Camera className="h-6 w-6" />}
          variant="primary"
        />
      </div>
    </div>
  );
};

export default NutritionPage;
