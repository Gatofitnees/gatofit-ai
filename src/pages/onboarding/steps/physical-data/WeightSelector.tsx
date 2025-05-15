
import React from "react";
import WheelSelector from "@/components/onboarding/wheel-selector/WheelSelector";

interface WeightSelectorProps {
  weightValues: Array<{ label: string; value: number }>;
  weight: number;
  onWeightChange: (value: number) => void;
}

const WeightSelector: React.FC<WeightSelectorProps> = ({ 
  weightValues, 
  weight, 
  onWeightChange 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block mb-2">Peso</label>
      <div className="h-[200px]">
        {weightValues.length > 0 && (
          <WheelSelector
            values={weightValues}
            onChange={onWeightChange}
            initialValue={weight}
            className="w-full"
            labelClassName="text-lg font-medium"
            itemHeight={45}
            visibleItems={5}
          />
        )}
      </div>
    </div>
  );
};

export default WeightSelector;
