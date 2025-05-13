
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const InitialRecommendation: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("InitialRecommendation must be used within OnboardingContext");
  }

  const { data, updateData } = context;
  const [isCalculating, setIsCalculating] = useState(true);

  // Calculate recommended macros based on user data
  useEffect(() => {
    // Simulate API calculation delay
    const timer = setTimeout(() => {
      const calculatedRecommendation = calculateInitialRecommendation(data);
      
      updateData({
        initial_recommended_calories: calculatedRecommendation.calories,
        initial_recommended_protein_g: calculatedRecommendation.protein,
        initial_recommended_carbs_g: calculatedRecommendation.carbs,
        initial_recommended_fats_g: calculatedRecommendation.fats
      });
      
      setIsCalculating(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    navigate("/onboarding/features-preview");
  };

  return (
    <OnboardingLayout currentStep={16} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">Tu Punto de Partida Personalizado</h1>

      <div className="w-full max-w-md mx-auto">
        {isCalculating ? (
          <div className="flex flex-col items-center p-8">
            <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">Analizando tus datos...</p>
          </div>
        ) : (
          <>
            <div className="neu-button p-6 rounded-xl mb-6">
              <h2 className="font-bold mb-3">Tus macronutrientes diarios recomendados:</h2>
              
              {/* Macros donut chart */}
              <div className="relative h-52 w-52 mx-auto my-6">
                <MacrosDonutChart
                  protein={data.initial_recommended_protein_g || 0}
                  carbs={data.initial_recommended_carbs_g || 0}
                  fats={data.initial_recommended_fats_g || 0}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{data.initial_recommended_calories}</span>
                  <span className="text-xs text-muted-foreground">calorías</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-semibold text-blue-400">{data.initial_recommended_protein_g}g</p>
                  <p className="text-xs">Proteínas</p>
                </div>
                <div>
                  <p className="font-semibold text-green-400">{data.initial_recommended_carbs_g}g</p>
                  <p className="text-xs">Carbos</p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-400">{data.initial_recommended_fats_g}g</p>
                  <p className="text-xs">Grasas</p>
                </div>
              </div>
            </div>
            
            <div className="neu-button p-6 rounded-xl">
              <h2 className="font-bold mb-2">Recomendación de entrenamiento:</h2>
              <p className="text-sm">
                Te recomendamos comenzar con {data.trainingsPerWeek} sesiones de entrenamiento 
                de intensidad moderada-alta por semana.
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              Estos son valores iniciales. GatofitAI los refinará a medida que aprendamos más de ti.
            </p>
          </>
        )}
      </div>

      <OnboardingNavigation 
        onNext={handleNext}
        nextDisabled={isCalculating}
      />
    </OnboardingLayout>
  );
};

// Simple function to calculate initial recommendation
const calculateInitialRecommendation = (data: any) => {
  // Very basic TDEE calculation (this would be more sophisticated in a real app)
  // This is just for demonstration purposes
  let bmr = 0;
  const weight = data.weight || 70; // Default in case weight is not provided
  const height = data.height || 170; // Default in case height is not provided
  const age = data.dateOfBirth ? 
    Math.floor((new Date().getTime() - new Date(data.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 30;
  
  // Basic BMR calculation using Mifflin-St Jeor Equation
  if (data.gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Activity factor based on training frequency
  const activityFactor = 1.2 + (data.trainingsPerWeek * 0.05);
  
  // TDEE: Total Daily Energy Expenditure
  let tdee = bmr * activityFactor;
  
  // Adjust based on goal
  if (data.mainGoal === 'lose_weight') {
    tdee -= 500; // Caloric deficit
  } else if (data.mainGoal === 'gain_muscle') {
    tdee += 300; // Caloric surplus
  }
  
  // Calculate macros (simplified)
  const proteinPerKg = data.mainGoal === 'gain_muscle' ? 2.2 : 2.0;
  const protein = Math.round(weight * proteinPerKg);
  const fats = Math.round((tdee * 0.25) / 9); // 25% of calories from fat
  const proteinCals = protein * 4;
  const fatsCals = fats * 9;
  const remainingCals = tdee - proteinCals - fatsCals;
  const carbs = Math.round(remainingCals / 4);
  
  return {
    calories: Math.round(tdee),
    protein,
    carbs,
    fats
  };
};

// Simple donut chart component
const MacrosDonutChart = ({ protein, carbs, fats }: { protein: number, carbs: number, fats: number }) => {
  const total = protein + carbs + fats;
  const proteinPercentage = Math.round(protein * 4 / (total * 4) * 100);
  const carbsPercentage = Math.round(carbs * 4 / (total * 4) * 100);
  const fatsPercentage = Math.round(fats * 9 / (total * 4) * 100);
  
  const proteinDash = 2 * Math.PI * 40 * (proteinPercentage / 100);
  const carbsDash = 2 * Math.PI * 40 * (carbsPercentage / 100);
  const fatsDash = 2 * Math.PI * 40 * (fatsPercentage / 100);
  
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#334155" strokeWidth="12" />
      
      {/* Proteins segment (starting at the top) */}
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        fill="transparent" 
        stroke="#60a5fa" 
        strokeWidth="12"
        strokeDasharray={`${proteinDash} ${2 * Math.PI * 40}`}
        transform="rotate(-90 50 50)"
      />
      
      {/* Carbs segment */}
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        fill="transparent" 
        stroke="#4ade80" 
        strokeWidth="12"
        strokeDasharray={`${carbsDash} ${2 * Math.PI * 40}`}
        strokeDashoffset={-proteinDash}
        transform="rotate(-90 50 50)"
      />
      
      {/* Fats segment */}
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        fill="transparent" 
        stroke="#fbbf24" 
        strokeWidth="12"
        strokeDasharray={`${fatsDash} ${2 * Math.PI * 40}`}
        strokeDashoffset={-(proteinDash + carbsDash)}
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
};

export default InitialRecommendation;
