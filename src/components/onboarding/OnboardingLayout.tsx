
import React from "react";
import { Progress } from "@/components/ui/progress";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  showProgress?: boolean;
  className?: string;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  showProgress = true,
  className = "",
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showProgress && (
        <div className="w-full px-4 pt-6 pb-2">
          <div className="max-w-md mx-auto">
            <Progress value={progressPercentage} className="h-1" />
          </div>
        </div>
      )}
      
      <main className={`flex-1 px-4 pb-32 pt-8 ${className}`}>
        <div className="max-w-md mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default OnboardingLayout;
