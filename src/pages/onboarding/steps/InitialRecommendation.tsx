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
  const [calculationError, setCalculationError] = useState(false);

  // Enhanced macro calculation with improved formula
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        console.log('Starting macro calculation with data:', data);
        const calculatedRecommendation = calculateOptimizedRecommendation(data);
        
        console.log('Calculated recommendation:', calculatedRecommendation);
        
        updateData({
          initial_recommended_calories: calculatedRecommendation.calories,
          initial_recommended_protein_g: calculatedRecommendation.protein,
          initial_recommended_carbs_g: calculatedRecommendation.carbs,
          initial_recommended_fats_g: calculatedRecommendation.fats
        });
        
        setIsCalculating(false);
      } catch (error) {
        console.error('Error calculating recommendations:', error);
        setCalculationError(true);
        
        // Fallback to basic calculations
        const fallbackRecommendation = {
          calories: 2000,
          protein: 120,
          carbs: 200,
          fats: 65
        };
        
        updateData({
          initial_recommended_calories: fallbackRecommendation.calories,
          initial_recommended_protein_g: fallbackRecommendation.protein,
          initial_recommended_carbs_g: fallbackRecommendation.carbs,
          initial_recommended_fats_g: fallbackRecommendation.fats
        });
        
        setIsCalculating(false);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [data, updateData]);

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
            {calculationError && (
              <p className="mt-2 text-sm text-orange-500">Usando valores por defecto...</p>
            )}
          </div>
        ) : (
          <>
            <div className="neu-button p-6 rounded-xl mb-6">
              <h2 className="font-bold mb-3">Tus macronutrientes diarios recomendados:</h2>
              
              {/* Macros donut chart */}
              <div className="relative h-52 w-52 mx-auto my-6">
                <MacrosDonutChart
                  protein={data.initial_recommended_protein_g || 120}
                  carbs={data.initial_recommended_carbs_g || 200}
                  fats={data.initial_recommended_fats_g || 65}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{data.initial_recommended_calories || 2000}</span>
                  <span className="text-xs text-muted-foreground">calorías</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-semibold text-blue-400">{data.initial_recommended_protein_g || 120}g</p>
                  <p className="text-xs">Proteínas</p>
                </div>
                <div>
                  <p className="font-semibold text-green-400">{data.initial_recommended_carbs_g || 200}g</p>
                  <p className="text-xs">Carbos</p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-400">{data.initial_recommended_fats_g || 65}g</p>
                  <p className="text-xs">Grasas</p>
                </div>
              </div>
            </div>
            
            <div className="neu-button p-6 rounded-xl">
              <h2 className="font-bold mb-2">Recomendación de entrenamiento:</h2>
              <p className="text-sm">
                Te recomendamos comenzar con {data.trainingsPerWeek || 3} sesiones de entrenamiento 
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

// Optimized function for calculating initial recommendation with enhanced formulas and error handling
const calculateOptimizedRecommendation = (data: any) => {
  try {
    const weight = data.weight || 70;
    const height = data.height || 170;
    const age = data.dateOfBirth ? 
      Math.floor((new Date().getTime() - new Date(data.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 30;
    const bodyFat = data.bodyFatPercentage;
    const trainingsPerWeek = data.trainingsPerWeek || 3;
    
    let bmr = 0;
    
    // Use Katch-McArdle if body fat is available, otherwise Mifflin-St Jeor
    if (bodyFat && bodyFat > 0 && bodyFat < 50) {
      // Katch-McArdle formula (more accurate with body fat percentage)
      const leanBodyMass = weight * (1 - bodyFat / 100);
      bmr = 370 + (21.6 * leanBodyMass);
    } else {
      // Mifflin-St Jeor Equation
      if (data.gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
    }
    
    // More precise activity factor based on training frequency
    let activityFactor = 1.2; // Sedentary baseline
    
    if (trainingsPerWeek >= 1 && trainingsPerWeek <= 2) {
      activityFactor = 1.375; // Light activity
    } else if (trainingsPerWeek >= 3 && trainingsPerWeek <= 4) {
      activityFactor = 1.55; // Moderate activity
    } else if (trainingsPerWeek >= 5 && trainingsPerWeek <= 6) {
      activityFactor = 1.725; // Very active
    } else if (trainingsPerWeek >= 7) {
      activityFactor = 1.9; // Extremely active
    }
    
    // TDEE: Total Daily Energy Expenditure
    let tdee = bmr * activityFactor;
    
    // Goal-specific adjustments
    if (data.mainGoal === 'lose_weight') {
      // More conservative deficit based on target pace
      if (data.targetPace === 'sloth') {
        tdee -= 250; // Small deficit - 0.25kg/week
      } else if (data.targetPace === 'rabbit') {
        tdee -= 500; // Moderate deficit - 0.5kg/week
      } else if (data.targetPace === 'leopard') {
        tdee -= 750; // Aggressive deficit - 0.75kg/week
      } else {
        tdee -= 400; // Default moderate deficit
      }
    } else if (data.mainGoal === 'gain_muscle') {
      // Lean bulk approach
      tdee += 300; // Conservative surplus for lean gains
    }
    // For 'maintain_weight', keep TDEE as is
    
    // Enhanced macro calculation
    let proteinPerKg = 2.0; // Default
    
    // Adjust protein based on goal and activity
    if (data.mainGoal === 'gain_muscle') {
      proteinPerKg = 2.4; // Higher for muscle building
    } else if (data.mainGoal === 'lose_weight') {
      proteinPerKg = 2.2; // Higher for muscle preservation during cut
    }
    
    // Adjust for training frequency
    if (trainingsPerWeek >= 5) {
      proteinPerKg += 0.2; // Extra protein for high training volume
    }
    
    const protein = Math.round(weight * proteinPerKg);
    
    // Fat calculation (20-30% of calories, adjusted by goal)
    let fatPercentage = 0.25; // Default 25%
    
    if (data.mainGoal === 'gain_muscle') {
      fatPercentage = 0.3; // Higher fat for hormone production
    } else if (data.mainGoal === 'lose_weight') {
      fatPercentage = 0.2; // Lower fat to allow more carbs/protein
    }
    
    const fats = Math.round((tdee * fatPercentage) / 9);
    
    // Carbs fill remaining calories
    const proteinCals = protein * 4;
    const fatsCals = fats * 9;
    const remainingCals = tdee - proteinCals - fatsCals;
    const carbs = Math.round(Math.max(remainingCals / 4, 50)); // Minimum 50g carbs
    
    // Ensure values are within reasonable ranges
    const calories = Math.max(1200, Math.min(4000, Math.round(tdee)));
    const finalProtein = Math.max(50, Math.min(300, protein));
    const finalCarbs = Math.max(50, Math.min(500, carbs));
    const finalFats = Math.max(30, Math.min(150, fats));
    
    return {
      calories,
      protein: finalProtein,
      carbs: finalCarbs,
      fats: finalFats
    };
  } catch (error) {
    console.error('Error in calculateOptimizedRecommendation:', error);
    // Return safe defaults
    return {
      calories: 2000,
      protein: 120,
      carbs: 200,
      fats: 65
    };
  }
};

// Simple donut chart component
const MacrosDonutChart = ({ protein, carbs, fats }: { protein: number, carbs: number, fats: number }) => {
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatsCals = fats * 9;
  const totalCals = proteinCals + carbsCals + fatsCals;
  
  const proteinPercentage = (proteinCals / totalCals) * 100;
  const carbsPercentage = (carbsCals / totalCals) * 100;
  const fatsPercentage = (fatsCals / totalCals) * 100;
  
  const circumference = 2 * Math.PI * 40;
  const proteinDash = circumference * (proteinPercentage / 100);
  const carbsDash = circumference * (carbsPercentage / 100);
  const fatsDash = circumference * (fatsPercentage / 100);
  
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#334155" strokeWidth="12" />
      
      {/* Proteins segment */}
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        fill="transparent" 
        stroke="#60a5fa" 
        strokeWidth="12"
        strokeDasharray={`${proteinDash} ${circumference}`}
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
        strokeDasharray={`${carbsDash} ${circumference}`}
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
        strokeDasharray={`${fatsDash} ${circumference}`}
        strokeDashoffset={-(proteinDash + carbsDash)}
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
};

export default InitialRecommendation;
