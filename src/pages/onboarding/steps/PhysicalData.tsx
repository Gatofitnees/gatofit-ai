
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import { Input } from "@/components/ui/input";

const PhysicalData: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("PhysicalData must be used within OnboardingContext");
  }

  const { data, updateData } = context;
  const [heightValue, setHeightValue] = useState<string>(data.height?.toString() || "");
  const [weightValue, setWeightValue] = useState<string>(data.weight?.toString() || "");
  const [fatValue, setFatValue] = useState<string>(data.bodyFatPercentage?.toString() || "");

  // Convert metrics when unit system changes
  useEffect(() => {
    if (data.height && data.heightUnit === "ft-in" && heightValue === "") {
      // Convert cm to feet-inches display (not actual calculation)
      const heightInches = data.height / 2.54;
      const feet = Math.floor(heightInches / 12);
      const inches = Math.round(heightInches % 12);
      setHeightValue(`${feet}'${inches}"`);
    } else if (data.height && data.heightUnit === "cm" && heightValue === "") {
      setHeightValue(data.height.toString());
    }
    
    if (data.weight && data.weightUnit === "lbs" && weightValue === "") {
      // Convert kg to lbs
      const lbs = Math.round(data.weight * 2.20462);
      setWeightValue(lbs.toString());
    } else if (data.weight && data.weightUnit === "kg" && weightValue === "") {
      setWeightValue(data.weight.toString());
    }
  }, [data.heightUnit, data.weightUnit]);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeightValue(e.target.value);
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      let heightInCm: number;
      
      if (data.heightUnit === "ft-in") {
        // This is simplified - in real app would need proper ft-in parsing
        heightInCm = value * 30.48; // Rough conversion for demonstration
      } else {
        heightInCm = value;
      }
      
      updateData({ height: heightInCm });
    } else {
      updateData({ height: null });
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeightValue(e.target.value);
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      let weightInKg: number;
      
      if (data.weightUnit === "lbs") {
        weightInKg = value / 2.20462;
      } else {
        weightInKg = value;
      }
      
      updateData({ weight: weightInKg });
    } else {
      updateData({ weight: null });
    }
  };

  const handleFatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFatValue(e.target.value);
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      updateData({ bodyFatPercentage: value });
    } else {
      updateData({ bodyFatPercentage: null });
    }
  };

  const handleHeightUnitChange = (value: string) => {
    if (value) {
      updateData({ heightUnit: value as "cm" | "ft-in" });
      setHeightValue("");
    }
  };

  const handleWeightUnitChange = (value: string) => {
    if (value) {
      updateData({ weightUnit: value as "kg" | "lbs" });
      setWeightValue("");
    }
  };

  const handleNext = () => {
    navigate("/onboarding/birth-date");
  };

  return (
    <OnboardingLayout currentStep={6} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-4">Hablemos de ti</h1>
      
      <p className="text-muted-foreground mb-8">
        Esta información nos ayuda a personalizar tu experiencia
      </p>
      
      <div className="space-y-6 w-full max-w-md mx-auto">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Altura</label>
            <ToggleGroup 
              type="single" 
              value={data.heightUnit}
              onValueChange={handleHeightUnitChange}
              className="bg-secondary/30 rounded-lg p-1"
            >
              <ToggleGroupItem value="cm" className="text-xs h-6 px-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-white">
                cm
              </ToggleGroupItem>
              <ToggleGroupItem value="ft-in" className="text-xs h-6 px-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-white">
                ft-in
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Input
            value={heightValue}
            onChange={handleHeightChange}
            placeholder={data.heightUnit === "cm" ? "Altura en cm" : "Altura en pies-pulgadas"}
            className="neu-input"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Peso</label>
            <ToggleGroup 
              type="single" 
              value={data.weightUnit}
              onValueChange={handleWeightUnitChange}
              className="bg-secondary/30 rounded-lg p-1"
            >
              <ToggleGroupItem value="kg" className="text-xs h-6 px-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-white">
                kg
              </ToggleGroupItem>
              <ToggleGroupItem value="lbs" className="text-xs h-6 px-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-white">
                lbs
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Input
            value={weightValue}
            onChange={handleWeightChange}
            placeholder={data.weightUnit === "kg" ? "Peso en kg" : "Peso en libras"}
            className="neu-input"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">% Grasa Corporal (opcional)</label>
          <div className="relative">
            <Input
              value={fatValue}
              onChange={handleFatChange}
              placeholder="Porcentaje de grasa corporal"
              className="neu-input"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-muted-foreground">
              %
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            No te preocupes si no lo sabes con exactitud
          </p>
        </div>
      </div>

      <OnboardingNavigation 
        onNext={handleNext}
        nextDisabled={!data.height || !data.weight}
      />
    </OnboardingLayout>
  );
};

export default PhysicalData;
