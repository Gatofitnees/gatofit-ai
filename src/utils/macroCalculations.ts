import { OnboardingData } from '@/pages/onboarding/OnboardingFlow';

export const calculateOptimizedRecommendation = (data: OnboardingData) => {
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
