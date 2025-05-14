
import React from "react";
import { motion } from "framer-motion";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sora">
      {/* Progress bar */}
      <div className="px-4 pt-4">
        <div className="h-1 w-full bg-secondary/30 rounded overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-1 bg-primary rounded"
          />
        </div>
        <div className="small text-muted-foreground mt-1 text-right">
          {currentStep}/{totalSteps}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 pb-32">
        <motion.div 
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
