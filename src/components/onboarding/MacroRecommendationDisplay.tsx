
import React from 'react';
import MacrosDonutChart from './MacrosDonutChart';

interface MacroRecommendationDisplayProps {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  trainingsPerWeek: number;
}

const MacroRecommendationDisplay: React.FC<MacroRecommendationDisplayProps> = ({
  calories,
  protein,
  carbs,
  fats,
  trainingsPerWeek
}) => {
  return (
    <>
      <div className="neu-button p-6 rounded-xl mb-6">
        <h2 className="font-bold mb-3">Tus macronutrientes diarios recomendados:</h2>
        
        {/* Macros donut chart */}
        <div className="relative h-52 w-52 mx-auto my-6">
          <MacrosDonutChart
            protein={protein}
            carbs={carbs}
            fats={fats}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{calories}</span>
            <span className="text-xs text-muted-foreground">calorías</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-semibold text-blue-400">{protein}g</p>
            <p className="text-xs">Proteínas</p>
          </div>
          <div>
            <p className="font-semibold text-green-400">{carbs}g</p>
            <p className="text-xs">Carbos</p>
          </div>
          <div>
            <p className="font-semibold text-yellow-400">{fats}g</p>
            <p className="text-xs">Grasas</p>
          </div>
        </div>
      </div>
      
      <div className="neu-button p-6 rounded-xl">
        <h2 className="font-bold mb-2">Recomendación de entrenamiento:</h2>
        <p className="text-sm">
          Te recomendamos comenzar con {trainingsPerWeek} sesiones de entrenamiento 
          de intensidad moderada-alta por semana.
        </p>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        Estos son valores iniciales. GatofitAI los refinará a medida que aprendamos más de ti.
      </p>
    </>
  );
};

export default MacroRecommendationDisplay;
