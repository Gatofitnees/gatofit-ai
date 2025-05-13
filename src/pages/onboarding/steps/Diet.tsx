
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils, Leaf, Fish } from "lucide-react";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import SelectableCard from "@/components/onboarding/SelectableCard";
import { OnboardingContext } from "../OnboardingFlow";

const Diet: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("Diet must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  const handleSelect = (dietId: number) => {
    updateData({ diet: dietId });
  };

  const handleNext = () => {
    navigate("/onboarding/desired-achievements");
  };

  // Diet options (matching the diet_types table in Supabase)
  const dietOptions = [
    { id: 1, name: "Omnívora", icon: <Utensils size={32} /> },
    { id: 2, name: "Vegetariana", icon: <Leaf size={32} /> },
    { id: 3, name: "Vegana", icon: <Leaf size={32} /> },
    { id: 4, name: "Pescetariana", icon: <Fish size={32} /> },
    { id: 5, name: "Keto", icon: <Utensils size={32} /> },
    { id: 6, name: "Paleo", icon: <Utensils size={32} /> }
  ];

  return (
    <OnboardingLayout currentStep={13} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿Sigues alguna dieta específica?</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {dietOptions.map((diet) => (
          <SelectableCard
            key={diet.id}
            selected={data.diet === diet.id}
            onSelect={() => handleSelect(diet.id)}
            icon={diet.icon}
            label={diet.name}
          >
            <span className="sr-only">{diet.name}</span>
          </SelectableCard>
        ))}
      </div>

      <OnboardingNavigation 
        onNext={handleNext}
        nextDisabled={!data.diet}
      />
    </OnboardingLayout>
  );
};

export default Diet;
