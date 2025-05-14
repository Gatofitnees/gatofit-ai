
import React from "react";
import { Switch } from "@/components/ui/switch";

interface UnitToggleProps {
  isMetric: boolean;
  onChange: (checked: boolean) => void;
}

const UnitToggle: React.FC<UnitToggleProps> = ({ isMetric, onChange }) => {
  return (
    <div className="flex items-center justify-center mb-8 w-full">
      <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3 w-72">
        <span className={`text-sm ${!isMetric ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          Imperial
        </span>
        <Switch 
          checked={isMetric}
          onCheckedChange={onChange}
          className="mx-4"
        />
        <span className={`text-sm ${isMetric ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          Métrico
        </span>
      </div>
    </div>
  );
};

export default UnitToggle;
