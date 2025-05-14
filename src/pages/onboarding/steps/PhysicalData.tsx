
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import WheelSelector from "@/components/onboarding/WheelSelector";
import { Switch } from "@/components/ui/switch";

const PhysicalData: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("PhysicalData must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  // Generate height values
  const generateHeightValues = (isMetric: boolean) => {
    if (isMetric) {
      // Centimeters (100-250 cm)
      return Array.from({ length: 151 }, (_, i) => ({
        label: `${i + 100} cm`,
        value: i + 100
      }));
    } else {
      // Feet (3-8)
      return Array.from({ length: 6 }, (_, i) => ({
        label: `${i + 3} ft`,
        value: i + 3
      }));
    }
  };

  // Generate inches values (0-11)
  const generateInchesValues = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      label: `${i} in`,
      value: i
    }));
  };

  // Generate weight values
  const generateWeightValues = (isMetric: boolean) => {
    if (isMetric) {
      // Kilograms (30-200 kg, increments of 0.5)
      return Array.from({ length: 341 }, (_, i) => ({
        label: `${(i * 0.5) + 30} kg`,
        value: (i * 0.5) + 30
      }));
    } else {
      // Pounds (60-440 lbs)
      return Array.from({ length: 381 }, (_, i) => ({
        label: `${i + 60} lb`,
        value: i + 60
      }));
    }
  };

  // Generate body fat percentage values (5-50%, increments of 0.5)
  const generateFatValues = () => {
    return Array.from({ length: 91 }, (_, i) => ({
      label: `${(i * 0.5) + 5}%`,
      value: (i * 0.5) + 5
    }));
  };

  const [isMetric, setIsMetric] = useState(data.weightUnit === "kg");
  const [heightValues, setHeightValues] = useState(generateHeightValues(isMetric));
  const [inchesValues] = useState(generateInchesValues());
  const [weightValues, setWeightValues] = useState(generateWeightValues(isMetric));
  const [fatValues] = useState(generateFatValues());
  
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);
  const [heightCm, setHeightCm] = useState<number>(data.height || 170);
  const [weight, setWeight] = useState<number>(data.weight || (isMetric ? 70 : 155));
  const [bodyFat, setBodyFat] = useState<number>(data.bodyFatPercentage || 20);

  // Update context when values change
  useEffect(() => {
    if (isMetric) {
      // Store height in cm
      updateData({ 
        height: heightCm,
        heightUnit: "cm",
        weight: weight,
        weightUnit: "kg",
        bodyFatPercentage: bodyFat,
        unit_system_preference: "metric"
      });
    } else {
      // Convert ft/in to cm for storage
      const heightInCm = Math.round((heightFt * 30.48) + (heightIn * 2.54));
      // Convert lbs to kg for storage
      const weightInKg = parseFloat((weight / 2.20462).toFixed(1));
      
      updateData({ 
        height: heightInCm,
        heightUnit: "ft-in",
        weight: weightInKg,
        weightUnit: "lbs",
        bodyFatPercentage: bodyFat,
        unit_system_preference: "imperial"
      });
    }
  }, [heightCm, heightFt, heightIn, weight, bodyFat, isMetric, updateData]);

  // Handle unit system change
  const handleUnitChange = (checked: boolean) => {
    const newIsMetric = checked;
    setIsMetric(newIsMetric);
    
    // Update selectors with new values
    setHeightValues(generateHeightValues(newIsMetric));
    setWeightValues(generateWeightValues(newIsMetric));
    
    // Convert values when switching systems
    if (newIsMetric) {
      // Convert from imperial to metric
      const cmValue = Math.round((heightFt * 30.48) + (heightIn * 2.54));
      setHeightCm(cmValue);
      
      const kgValue = parseFloat((weight / 2.20462).toFixed(1));
      setWeight(kgValue);
    } else {
      // Convert from metric to imperial
      const totalInches = heightCm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      
      setHeightFt(ft);
      setHeightIn(inches);
      
      const lbsValue = Math.round(weight * 2.20462);
      setWeight(lbsValue);
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
      
      <div className="flex items-center justify-center mb-8 w-full">
        <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3 w-72">
          <span className={`text-sm ${!isMetric ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Imperial
          </span>
          <Switch 
            checked={isMetric}
            onCheckedChange={handleUnitChange}
            className="mx-4"
          />
          <span className={`text-sm ${isMetric ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Métrico
          </span>
        </div>
      </div>
      
      <div className="space-y-10 w-full max-w-xs mx-auto">
        {isMetric ? (
          <div className="space-y-2">
            <label className="text-sm font-medium block mb-2">Altura</label>
            <div className="h-[200px]">
              {heightValues.length > 0 && (
                <WheelSelector
                  values={heightValues}
                  onChange={(value) => setHeightCm(value)}
                  initialValue={heightCm}
                  className="w-full"
                  labelClassName="text-lg"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium block mb-2">Altura</label>
            <div className="flex space-x-2 h-[200px]">
              {heightValues.length > 0 && (
                <WheelSelector
                  values={heightValues}
                  onChange={(value) => setHeightFt(value)}
                  initialValue={heightFt}
                  className="w-1/2"
                  labelClassName="text-lg"
                />
              )}
              {inchesValues.length > 0 && (
                <WheelSelector
                  values={inchesValues}
                  onChange={(value) => setHeightIn(value)}
                  initialValue={heightIn}
                  className="w-1/2"
                  labelClassName="text-lg"
                />
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium block mb-2">Peso</label>
          <div className="h-[200px]">
            {weightValues.length > 0 && (
              <WheelSelector
                values={weightValues}
                onChange={(value) => setWeight(value)}
                initialValue={weight}
                className="w-full"
                labelClassName="text-lg"
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block mb-2">% Grasa Corporal (opcional)</label>
          <div className="h-[200px]">
            {fatValues.length > 0 && (
              <WheelSelector
                values={fatValues}
                onChange={(value) => setBodyFat(value)}
                initialValue={bodyFat}
                className="w-full"
                labelClassName="text-lg"
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            No te preocupes si no lo sabes con exactitud
          </p>
        </div>
      </div>

      <div className="h-20"></div> {/* Spacer for navigation */}

      <OnboardingNavigation 
        onNext={handleNext}
        nextDisabled={!data.height || !data.weight}
      />
    </OnboardingLayout>
  );
};

export default PhysicalData;
