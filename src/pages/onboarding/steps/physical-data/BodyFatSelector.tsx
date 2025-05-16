
import React from "react";
import WheelSelector from "@/components/onboarding/wheel-selector/WheelSelector";

interface BodyFatSelectorProps {
  fatValues: Array<{ label: string; value: number }>;
  bodyFat: number;
  onBodyFatChange: (value: number) => void;
}

const BodyFatSelector: React.FC<BodyFatSelectorProps> = ({ 
  fatValues, 
  bodyFat, 
  onBodyFatChange 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block mb-2">% Grasa Corporal (opcional)</label>
      <div className="h-[200px]">
        {fatValues.length > 0 && (
          <WheelSelector
            values={fatValues}
            onChange={onBodyFatChange}
            initialValue={bodyFat}
            className="w-full"
            labelClassName="text-lg font-medium"
            itemHeight={45}
            visibleItems={5}
          />
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs text-muted-foreground">
          No te preocupes si no lo sabes con exactitud
        </p>
      </div>
    </div>
  );
};

export default BodyFatSelector;
