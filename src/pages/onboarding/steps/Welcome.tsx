
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/onboarding/gender");
  };

  return (
    <OnboardingLayout currentStep={1} totalSteps={20}>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-white">GF</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="h1 mb-2"
        >
          ¡Bienvenido/a a{" "}
          <span className="text-galactic">GatofitAI</span>!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="body text-muted-foreground mb-8"
        >
          Prepárate para transformar tu fitness con inteligencia.
        </motion.p>

        <motion.div
          className="absolute bottom-0 left-0 w-full h-1/3 opacity-10 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            background: "radial-gradient(circle at bottom, var(--primary) 0%, transparent 70%)",
          }}
        />
      </div>

      <OnboardingNavigation 
        onNext={handleNext} 
        nextLabel="Empezar Viaje" 
        showBack={false} 
      />
    </OnboardingLayout>
  );
};

export default Welcome;
