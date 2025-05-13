
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { User, Users } from "lucide-react";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import SelectableCard from "@/components/onboarding/SelectableCard";
import { OnboardingContext } from "../OnboardingFlow";

const Gender: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("Gender must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  const handleSelect = (gender: string) => {
    updateData({ gender });
  };

  const handleNext = () => {
    navigate("/onboarding/training-frequency");
  };

  return (
    <OnboardingLayout currentStep={2} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿Cómo te identificas?</h1>

      <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto w-full">
        <SelectableCard
          selected={data.gender === "male"}
          onSelect={() => handleSelect("male")}
          icon={<User size={32} />}
          label="Masculino"
        >
          <span className="sr-only">Masculino</span>
        </SelectableCard>
        
        <SelectableCard
          selected={data.gender === "female"}
          onSelect={() => handleSelect("female")}
          icon={<User size={32} />}
          label="Femenino"
        >
          <span className="sr-only">Femenino</span>
        </SelectableCard>
        
        <SelectableCard
          selected={data.gender === "other"}
          onSelect={() => handleSelect("other")}
          icon={<Users size={32} />}
          label="Otro / Prefiero no decirlo"
        >
          <span className="sr-only">Otro / Prefiero no decirlo</span>
        </SelectableCard>
      </div>

      <OnboardingNavigation 
        onNext={handleNext}
        nextDisabled={!data.gender}
      />
    </OnboardingLayout>
  );
};

export default Gender;
