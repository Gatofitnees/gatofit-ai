
import React from "react";
import WheelSelector from "@/components/onboarding/wheel-selector/WheelSelector";

interface ImperialHeightSelectorProps {
  heightValues: Array<{ label: string; value: number }>;
  inchesValues: Array<{ label: string; value: number }>;
  heightFt: number;
  heightIn: number;
  onHeightFtChange: (value: number) => void;
  onHeightInChange: (value: number) => void;
}

const ImperialHeightSelector: React.FC<ImperialHeightSelectorProps> = ({ 
  heightValues, 
  inchesValues, 
  heightFt, 
  heightIn, 
  onHeightFtChange,
  onHeightInChange 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block mb-2">Altura</label>
      <div className="flex space-x-2 h-[200px]">
        {heightValues.length > 0 && (
          <WheelSelector
            values={heightValues}
            onChange={onHeightFtChange}
            initialValue={heightFt}
            className="w-1/2"
            labelClassName="text-lg font-medium"
            itemHeight={45}
            visibleItems={5}
          />
        )}
        {inchesValues.length > 0 && (
          <WheelSelector
            values={inchesValues}
            onChange={onHeightInChange}
            initialValue={heightIn}
            className="w-1/2"
            labelClassName="text-lg font-medium"
            itemHeight={45}
            visibleItems={5}
          />
        )}
      </div>
    </div>
  );
};

export default ImperialHeightSelector;
