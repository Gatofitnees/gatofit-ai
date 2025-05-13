
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils, Leaf, Fish, Avocado } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import SelectableCard from "@/components/onboarding/SelectableCard";
import { OnboardingContext } from "../OnboardingFlow";
import { supabase } from "@/integrations/supabase/client";

interface DietType {
  id: number;
  name: string;
  icon_name: string | null;
  description: string | null;
}

// Static diets for the demo
const DIETS = [
  { id: 1, name: "Omnívora", icon_name: "utensils", description: "Dieta regular incluyendo todos los grupos de alimentos" },
  { id: 2, name: "Vegetariana", icon_name: "leaf", description: "Sin carne, pero puede incluir lácteos y huevos" },
  { id: 3, name: "Vegana", icon_name: "leaf", description: "Sin productos animales en absoluto" },
  { id: 4, name: "Pescetariana", icon_name: "fish", description: "Vegetariana más mariscos" },
  { id: 5, name: "Keto", icon_name: "utensils", description: "Dieta baja en carbohidratos, alta en grasas" },
  { id: 6, name: "Paleo", icon_name: "utensils", description: "Basada en alimentos presumiblemente consumidos durante la era paleolítica" }
];

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

  // Helper to get icon component by name
  const getIconByName = (iconName: string | null) => {
    switch (iconName) {
      case "utensils": return <Utensils size={32} />;
      case "leaf": return <Leaf size={32} />;
      case "fish": return <Fish size={32} />;
      default: return <Utensils size={32} />;
    }
  };

  return (
    <OnboardingLayout currentStep={13} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿Sigues alguna dieta específica?</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto w-full">
        {DIETS.map((diet) => (
          <SelectableCard
            key={diet.id}
            selected={data.diet === diet.id}
            onSelect={() => handleSelect(diet.id)}
            icon={getIconByName(diet.icon_name)}
            label={diet.name}
          >
            <p className="text-xs text-muted-foreground text-center mt-1">
              {diet.description}
            </p>
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
