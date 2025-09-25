
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import GatofitAILogo from "@/components/GatofitAILogo";
import { Button } from "@/components/ui/button";

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/onboarding/gender");
  };

  const handleLogin = () => {
    navigate("/onboarding/login");
  };

  return (
    <OnboardingLayout currentStep={1} totalSteps={20}>
      {/* Login button positioned below progress bar */}
      <div className="absolute top-16 right-4 z-10">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLogin}
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 px-4 py-2 rounded-lg border border-border/50 hover:border-border bg-background/80 backdrop-blur-sm"
        >
          Iniciar sesión
        </Button>
      </div>

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
