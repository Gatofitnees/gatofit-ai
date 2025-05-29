
import React from 'react';
import { getExperienceProgress } from '@/utils/rankSystem';

interface ExperienceBarProps {
  totalExperience: number;
  className?: string;
}

const ExperienceBar: React.FC<ExperienceBarProps> = ({ 
  totalExperience, 
  className = '' 
}) => {
  const { currentLevelXP, nextLevelXP, progress } = getExperienceProgress(totalExperience);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{currentLevelXP} XP</span>
        <span>{nextLevelXP} XP</span>
      </div>
      <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ExperienceBar;
