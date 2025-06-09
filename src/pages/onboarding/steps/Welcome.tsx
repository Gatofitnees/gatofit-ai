
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import GatofitAILogo from "@/components/GatofitAILogo";

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/onboarding/gender");
  };

  return (
    <OnboardingLayout currentStep={1} totalSteps={20}>
      <div className="flex flex-col items-center justify-center flex-1 text-center min-h-[calc(100vh-200px)]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <GatofitAILogo size="xl" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold mb-4"
        >
          Bienvenido a tu viaje fitness
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-muted-foreground mb-8 max-w-md"
        >
          Preparado y diseñado para ti, con enfoque en resultados reales y sostenibles.
        </motion.p>
      </div>

      <OnboardingNavigation 
        onNext={handleStart}
        nextLabel="Empezar mi viaje"
        showBack={false}
      />
    </OnboardingLayout>
  );
};

export default Welcome;
