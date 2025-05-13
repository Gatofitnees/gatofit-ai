import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import NeuSlider from "@/components/onboarding/NeuSlider";
import { OnboardingContext } from "../OnboardingFlow";

const TargetWeight: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("TargetWeight must be used within OnboardingContext");
  }

  const { data, updateData } = context;
  
  const [sliderValue, setSliderValue] = useState<number[]>([data.weight || 70]);
  
  useEffect(() => {
    // If target weight exists, use it as the slider value
    if (data.targetWeight) {
      setSliderValue([data.targetWeight]);
    } else if (data.weight) {
      // Otherwise, initialize with current weight
      setSliderValue([data.weight]);
      updateData({ targetWeight: data.weight });
    }
  }, [data.weight]);
  
  // Set min/max values based on current weight and goal
  let minWeight = 40; // Minimum healthy weight
  let maxWeight = 200; // Maximum weight on slider
  
  if (data.weight) {
    if (data.mainGoal === "lose_weight") {
      minWeight = Math.max(minWeight, data.weight * 0.7); // Can lose up to 30%
      maxWeight = data.weight;
    } else if (data.mainGoal === "gain_muscle") {
      minWeight = data.weight;
      maxWeight = Math.min(maxWeight, data.weight * 1.3); // Can gain up to 30%
    } else {
      // For maintain, allow small range
      minWeight = data.weight * 0.95;
      maxWeight = data.weight * 1.05;
    }
  }

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    updateData({ targetWeight: value[0] });
  };

  const handleNext = () => {
    navigate("/onboarding/goal-realism");
  };

  // Get relevant title based on goal
  let title = "Define tu peso objetivo";
  if (data.mainGoal === "maintain_weight") {
    title = "¿Cuál es tu peso ideal para mantener?";
  }

  // Calculate difference from current weight
  const weightDiff = data.targetWeight && data.weight 
    ? Math.abs(data.targetWeight - data.weight)
    : 0;
    
  const isGain = data.targetWeight && data.weight 
    ? data.targetWeight > data.weight 
    : false;

  return (
    <OnboardingLayout currentStep={9} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      <div className="w-full max-w-md mx-auto">
        <NeuSlider
          min={Math.floor(minWeight)}
          max={Math.ceil(maxWeight)}
          step={0.5}
          value={sliderValue}
          onValueChange={handleSliderChange}
          className="my-12"
        />

        <div className="flex justify-between text-xs text-muted-foreground mb-8">
          <span>{Math.floor(minWeight)} {data.weightUnit}</span>
          <span>{Math.ceil(maxWeight)} {data.weightUnit}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/20 rounded-xl neu-card p-4 text-center">
            <span className="text-sm text-muted-foreground mb-1 block">
              Peso actual
            </span>
            <span className="text-xl font-bold">
              {data.weight ? data.weight.toFixed(1) : "–"} {data.weightUnit}
            </span>
          </div>
          
          <div className="bg-secondary/20 rounded-xl neu-card p-4 text-center">
            <span className="text-sm text-muted-foreground mb-1 block">
              Peso objetivo
            </span>
            <span className="text-xl font-bold text-primary">
              {data.targetWeight ? data.targetWeight.toFixed(1) : "–"} {data.weightUnit}
            </span>
          </div>
        </div>

        {weightDiff > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm font-medium">
              {isGain ? "Ganarás" : "Perderás"} aproximadamente
            </p>
            <p className="text-2xl font-bold text-primary">
              {weightDiff.toFixed(1)} {data.weightUnit}
            </p>
          </div>
        )}
      </div>

      <OnboardingNavigation 
        onNext={handleNext}
        nextDisabled={!data.targetWeight}
      />
    </OnboardingLayout>
  );
};

export default TargetWeight;
