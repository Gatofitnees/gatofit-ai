
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getPasswordStrengthColor, getPasswordStrengthText } from '@/utils/enhancedPasswordValidation';

interface PasswordStrengthIndicatorProps {
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  errors: string[];
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
  errors,
  className = ''
}) => {
  const getStrengthValue = (strength: string): number => {
    switch (strength) {
      case 'very_strong': return 100;
      case 'strong': return 75;
      case 'medium': return 50;
      case 'weak': return 25;
      default: return 0;
    }
  };

  const getStrengthColor = (strength: string): string => {
    switch (strength) {
      case 'very_strong': return 'bg-green-500';
      case 'strong': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Password Strength:</span>
        <span className={`text-sm font-medium ${getPasswordStrengthColor(strength)}`}>
          {getPasswordStrengthText(strength)}
        </span>
      </div>
      
      <Progress 
        value={getStrengthValue(strength)} 
        className="h-2"
      />
      
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-red-600">
              • {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
