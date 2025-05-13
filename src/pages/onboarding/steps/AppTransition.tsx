
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useAuth } from "@/contexts/AuthContext";

const AppTransition: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Automatic redirect after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
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
        className="text-xl font-bold mb-2 text-center"
      >
        {user ? "¡Bienvenido a GatofitAI!" : "Preparando tu experiencia personalizada..."}
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-16 h-16 flex justify-center items-center"
      >
        <svg className="w-10 h-10 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </motion.div>
      
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1/3 opacity-10 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.7, duration: 1 }}
        style={{
          background: "radial-gradient(circle at bottom, var(--primary) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default AppTransition;
