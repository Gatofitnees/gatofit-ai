
import React from "react";

interface ConfigInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

const ConfigInput: React.FC<ConfigInputProps> = ({
  label,
  value,
  min = 1,
  max,
  step,
  onChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    onChange(newValue);
  };

  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-8 rounded-lg px-3 bg-secondary border-none text-sm"
      />
    </div>
  );
};

export default ConfigInput;
