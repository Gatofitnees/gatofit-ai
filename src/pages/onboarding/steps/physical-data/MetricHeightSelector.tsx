
import React from "react";
import WheelSelector from "@/components/onboarding/WheelSelector";

interface MetricHeightSelectorProps {
  heightValues: Array<{ label: string; value: number }>;
  heightCm: number;
  onHeightChange: (value: number) => void;
}

const MetricHeightSelector: React.FC<MetricHeightSelectorProps> = ({ 
  heightValues, 
  heightCm, 
  onHeightChange 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block mb-2">Altura</label>
      <div className="h-[200px]">
        {heightValues.length > 0 && (
          <WheelSelector
            values={heightValues}
            onChange={onHeightChange}
            initialValue={heightCm}
            className="w-full"
            labelClassName="text-lg"
          />
        )}
      </div>
    </div>
  );
};

export default MetricHeightSelector;
