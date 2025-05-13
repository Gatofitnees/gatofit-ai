
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const GoalRealism: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("GoalRealism must be used within OnboardingContext");
  }

  const { data } = context;

  const handleNext = () => {
    navigate("/onboarding/desired-pace");
  };

  // Evaluate if the goal is realistic
  const weightDiff = data.targetWeight && data.weight 
    ? Math.abs(data.targetWeight - data.weight)
    : 0;
  
  const isRealistic = weightDiff < 30; // Simplified check for demo

  const getMessage = () => {
    if (!data.targetWeight || !data.weight) {
      return "Analizando tu objetivo...";
    }
    
    if (data.mainGoal === "maintain_weight") {
      return "¡Mantener tu peso actual es un objetivo perfectamente realista!";
    }
    
    const targetText = data.targetWeight > data.weight
      ? `Ganar ${weightDiff.toFixed(1)} ${data.weightUnit}`
      : `Perder ${weightDiff.toFixed(1)} ${data.weightUnit}`;
    
    if (isRealistic) {
      return `¡Genial! ${targetText} es un objetivo muy realista.`;
    } else {
      return `Es un objetivo ambicioso, ¡te ayudaremos a ajustarlo si es necesario!`;
    }
  };

  return (
    <OnboardingLayout currentStep={10} totalSteps={20}>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          {isRealistic ? (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <svg className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
        </motion.div>

        <h1 className="text-2xl font-bold mb-4">
          {getMessage()}
        </h1>

        <p className="text-muted-foreground">
          Con constancia y el plan adecuado, lo conseguirás.
        </p>
      </div>

      <OnboardingNavigation onNext={handleNext} />
    </OnboardingLayout>
  );
};

export default GoalRealism;
