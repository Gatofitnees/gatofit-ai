
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import NeuSlider from "@/components/onboarding/NeuSlider";
import { OnboardingContext } from "../OnboardingFlow";

const DesiredPace: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("DesiredPace must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  // Convert from slider value to pace type
  const getPaceFromValue = (value: number): "sloth" | "rabbit" | "leopard" => {
    if (value <= 33) return "sloth";
    if (value <= 66) return "rabbit";
    return "leopard";
  };
  
  // Convert from pace type to slider value
  const getValueFromPace = (): number => {
    switch (data.targetPace) {
      case "sloth": return 16;
      case "rabbit": return 50;
      case "leopard": return 83;
      default: return 50; // Default to middle
    }
  };

  const handleSliderChange = (value: number[]) => {
    const pace = getPaceFromValue(value[0]);
    
    // Calculate weekly target based on pace and goal
    let weeklyTarget = 0;
    if (data.mainGoal === "lose_weight") {
      weeklyTarget = pace === "sloth" ? 0.25 : pace === "rabbit" ? 0.5 : 0.75;
    } else if (data.mainGoal === "gain_muscle") {
      weeklyTarget = pace === "sloth" ? 0.15 : pace === "rabbit" ? 0.3 : 0.5;
    }
    
    updateData({ 
      targetPace: pace,
      targetKgPerWeek: weeklyTarget
    });
  };

  const handleNext = () => {
    navigate("/onboarding/common-obstacles");
  };

  // Get description for current pace
  const getPaceDescription = (): { title: string; desc: string } => {
    switch (data.targetPace) {
      case "sloth":
        return { 
          title: "Constante y Sostenible", 
          desc: data.mainGoal === "lose_weight" 
            ? "~0.25-0.5 kg/semana" 
            : "~0.15-0.25 kg/semana" 
        };
      case "rabbit":
        return { 
          title: "Equilibrado y Efectivo", 
          desc: data.mainGoal === "lose_weight" 
            ? "~0.5-0.75 kg/semana" 
            : "~0.25-0.4 kg/semana" 
        };
      case "leopard":
        return { 
          title: "Intenso y Veloz", 
          desc: data.mainGoal === "lose_weight" 
            ? "~0.75-1 kg/semana" 
            : "~0.4-0.5 kg/semana" 
        };
      default:
        return { title: "Selecciona un ritmo", desc: "" };
    }
  };

  const paceInfo = getPaceDescription();

  return (
    <OnboardingLayout currentStep={11} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-4">¿A qué ritmo quieres alcanzar tu meta?</h1>
      
      <p className="text-muted-foreground mb-8">
        Desliza para elegir el ritmo que mejor se adapte a tus necesidades
      </p>

      <div className="w-full max-w-md mx-auto">
        {/* Slider with icons */}
        <div className="relative">
          <NeuSlider
            min={0}
            max={100}
            step={1}
            value={[getValueFromPace()]}
            onValueChange={handleSliderChange}
            className="my-12"
          />

          <div className="flex justify-between absolute w-full -mt-10">
            <div className="flex flex-col items-center">
              <span role="img" aria-label="sloth" className="text-xl">🐢</span>
              <span className="text-xs text-muted-foreground">Lento</span>
            </div>
            <div className="flex flex-col items-center">
              <span role="img" aria-label="rabbit" className="text-xl">🐇</span>
              <span className="text-xs text-muted-foreground">Medio</span>
            </div>
            <div className="flex flex-col items-center">
              <span role="img" aria-label="leopard" className="text-xl">🐆</span>
              <span className="text-xs text-muted-foreground">Rápido</span>
            </div>
          </div>
        </div>

        {/* Current selection info */}
        {data.targetPace && (
          <div className="mt-12 bg-secondary/20 rounded-xl neu-card p-6 text-center">
            <h3 className="text-lg font-semibold text-primary mb-1">
              {paceInfo.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {paceInfo.desc}
            </p>
            
            <div className="flex justify-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Intensidad</p>
                <p className="font-medium">
                  {data.targetPace === "sloth" ? "Baja" : 
                   data.targetPace === "rabbit" ? "Media" : "Alta"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sostenibilidad</p>
                <p className="font-medium">
                  {data.targetPace === "sloth" ? "Alta" : 
                   data.targetPace === "rabbit" ? "Media" : "Baja"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <OnboardingNavigation 
        onNext={handleNext}
        nextDisabled={!data.targetPace}
      />
    </OnboardingLayout>
  );
};

export default DesiredPace;
