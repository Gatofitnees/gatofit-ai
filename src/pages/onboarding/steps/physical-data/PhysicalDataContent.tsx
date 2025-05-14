
import React from "react";
import UnitToggle from "./UnitToggle";
import MetricHeightSelector from "./MetricHeightSelector";
import ImperialHeightSelector from "./ImperialHeightSelector";
import WeightSelector from "./WeightSelector";
import BodyFatSelector from "./BodyFatSelector";

interface PhysicalDataContentProps {
  isMetric: boolean;
  onUnitChange: (checked: boolean) => void;
  heightValues: Array<{ label: string; value: number }>;
  inchesValues: Array<{ label: string; value: number }>;
  weightValues: Array<{ label: string; value: number }>;
  fatValues: Array<{ label: string; value: number }>;
  heightCm: number;
  heightFt: number;
  heightIn: number;
  weight: number;
  bodyFat: number;
  setHeightCm: (value: number) => void;
  setHeightFt: (value: number) => void;
  setHeightIn: (value: number) => void;
  setWeight: (value: number) => void;
  setBodyFat: (value: number) => void;
}

const PhysicalDataContent: React.FC<PhysicalDataContentProps> = ({
  isMetric,
  onUnitChange,
  heightValues,
  inchesValues,
  weightValues,
  fatValues,
  heightCm,
  heightFt,
  heightIn,
  weight,
  bodyFat,
  setHeightCm,
  setHeightFt,
  setHeightIn,
  setWeight,
  setBodyFat
}) => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Hablemos de ti</h1>
      
      <p className="text-muted-foreground mb-8">
        Esta información nos ayuda a personalizar tu experiencia
      </p>
      
      <UnitToggle isMetric={isMetric} onChange={onUnitChange} />
      
      <div className="space-y-10 w-full max-w-xs mx-auto">
        {isMetric ? (
          <MetricHeightSelector 
            heightValues={heightValues}
            heightCm={heightCm}
            onHeightChange={setHeightCm}
          />
        ) : (
          <ImperialHeightSelector 
            heightValues={heightValues}
            inchesValues={inchesValues}
            heightFt={heightFt}
            heightIn={heightIn}
            onHeightFtChange={setHeightFt}
            onHeightInChange={setHeightIn}
          />
        )}

        <WeightSelector 
          weightValues={weightValues}
          weight={weight}
          onWeightChange={setWeight}
        />

        <BodyFatSelector 
          fatValues={fatValues}
          bodyFat={bodyFat}
          onBodyFatChange={setBodyFat}
        />
      </div>

      <div className="h-20"></div> {/* Spacer for navigation */}
    </>
  );
};

export default PhysicalDataContent;
