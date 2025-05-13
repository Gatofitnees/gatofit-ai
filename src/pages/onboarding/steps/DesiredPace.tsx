
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const DesiredPace: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("DesiredPace must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  // Calculate weekly weight change rate based on pace
  useEffect(() => {
    if (data.targetPace) {
      let kgPerWeek = 0;
      
      // Set kg per week based on pace selection
      switch (data.targetPace) {
        case "sloth": // Slow
          kgPerWeek = 0.25;
          break;
        case "rabbit": // Medium
          kgPerWeek = 0.5;
          break;
        case "leopard": // Fast
          kgPerWeek = 0.75;
          break;
        default:
          kgPerWeek = 0.5;
      }
      
      updateData({ targetKgPerWeek: kgPerWeek });
    }
  }, [data.targetPace, updateData]);

  const handleSelect = (pace: "sloth" | "rabbit" | "leopard") => {
    updateData({ targetPace: pace });
  };

  const handleNext = () => {
    navigate("/onboarding/common-obstacles");
  };

  return (
    <OnboardingLayout currentStep={11} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿A qué ritmo quieres alcanzar tu meta?</h1>
      
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="neu-button p-5 rounded-xl relative">
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={data.targetPace === "sloth" ? 1 : data.targetPace === "rabbit" ? 2 : data.targetPace === "leopard" ? 3 : 2}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val === 1) handleSelect("sloth");
              else if (val === 2) handleSelect("rabbit");
              else handleSelect("leopard");
            }}
            className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer"
          />
          
          <div className="flex justify-between mt-6 text-sm">
            <div className="flex flex-col items-center">
              <span className="text-xl">🐢</span>
              <p className="font-medium mt-1">Constante</p>
              <p className="text-xs text-muted-foreground">~0.25-0.5 kg/semana</p>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-xl">🐇</span>
              <p className="font-medium mt-1">Equilibrado</p>
              <p className="text-xs text-muted-foreground">~0.5-0.75 kg/semana</p>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-xl">🐆</span>
              <p className="font-medium mt-1">Intenso</p>
              <p className="text-xs text-muted-foreground">~0.75-1 kg/semana</p>
            </div>
          </div>
        </div>
        
        {/* Feedback about selected pace */}
        {data.targetPace && (
          <div className="text-center text-sm">
            <p>
              {data.targetPace === "sloth" && "Este es un ritmo sostenible ideal para cambios graduales y a largo plazo."}
              {data.targetPace === "rabbit" && "Este es un buen equilibrio entre resultados y sostenibilidad."}
              {data.targetPace === "leopard" && "Este ritmo es más exigente y requiere mayor disciplina y constancia."}
            </p>
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
