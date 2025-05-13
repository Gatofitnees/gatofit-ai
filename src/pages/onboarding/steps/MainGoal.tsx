
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Scale, Heart } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import SelectableCard from "@/components/onboarding/SelectableCard";
import { OnboardingContext } from "../OnboardingFlow";

const MainGoal: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("MainGoal must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  const handleSelect = (goal: "gain_muscle" | "lose_weight" | "maintain_weight") => {
    updateData({ mainGoal: goal });
  };

  const handleNext = () => {
    navigate("/onboarding/target-weight");
  };

  return (
    <OnboardingLayout currentStep={8} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿Cuál es tu principal objetivo de fitness?</h1>

      <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto w-full">
        <SelectableCard
          selected={data.mainGoal === "gain_muscle"}
          onSelect={() => handleSelect("gain_muscle")}
          icon={<Dumbbell size={32} />}
          label="Ganar Masa Muscular"
        >
          <p className="text-xs text-muted-foreground text-center mt-1">
            Aumentar fuerza y volumen muscular
          </p>
        </SelectableCard>
        
        <SelectableCard
          selected={data.mainGoal === "lose_weight"}
          onSelect={() => handleSelect("lose_weight")}
          icon={<Scale size={32} />}
          label="Perder Peso / Grasa"
        >
          <p className="text-xs text-muted-foreground text-center mt-1">
            Reducir peso y porcentaje de grasa
          </p>
        </SelectableCard>
        
        <SelectableCard
          selected={data.mainGoal === "maintain_weight"}
          onSelect={() => handleSelect("maintain_weight")}
          icon={<Heart size={32} />}
          label="Mantenerme en Forma"
        >
          <p className="text-xs text-muted-foreground text-center mt-1">
            Mantener peso y mejorar salud general
          </p>
        </SelectableCard>
      </div>

      <OnboardingNavigation 
        onNext={handleNext}
        nextDisabled={!data.mainGoal}
      />
    </OnboardingLayout>
  );
};

export default MainGoal;
