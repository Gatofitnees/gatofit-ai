
import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingContext } from "../OnboardingFlow";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";

const AppTransition: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const context = useContext(OnboardingContext);
  const { saveOnboardingToProfile, loadOnboardingData } = useOnboardingPersistence();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("Iniciando...");
  const [hasCompleted, setHasCompleted] = useState(false);
  const [saveAttempts, setSaveAttempts] = useState(0);
  
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const handleTransition = async () => {
      if (hasCompleted || isProcessing) {
        console.log('AppTransition: Already processed or processing, skipping...');
        return;
      }

      console.log('AppTransition: Starting transition process');
      setIsProcessing(true);
      setProcessingStep("Verificando autenticación...");
      
      try {
        // Wait a moment for the auth state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!isMounted) return;
        
        setProcessingStep("Buscando datos de configuración...");
        const onboardingData = loadOnboardingData();
        
        if (onboardingData) {
          console.log('AppTransition: Found onboarding data, attempting to save...', onboardingData);
          setProcessingStep("Guardando tu configuración...");
          
          // Try to save with multiple attempts
          let saveSuccess = false;
          let attempts = 0;
          const maxAttempts = 3;
          
          while (!saveSuccess && attempts < maxAttempts && isMounted) {
            attempts++;
            setSaveAttempts(attempts);
            
            if (attempts > 1) {
              setProcessingStep(`Reintentando guardado (${attempts}/${maxAttempts})...`);
              console.log(`AppTransition: Save attempt ${attempts}/${maxAttempts}`);
            }
            
            try {
              saveSuccess = await saveOnboardingToProfile(onboardingData);
              
              if (saveSuccess) {
                console.log('AppTransition: Onboarding data saved successfully');
                setProcessingStep("¡Configuración guardada exitosamente!");
                break;
              } else {
                console.error(`AppTransition: Save attempt ${attempts} failed`);
                if (attempts < maxAttempts) {
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
                }
              }
            } catch (error) {
              console.error(`AppTransition: Error in save attempt ${attempts}:`, error);
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
              }
            }
          }
          
          if (!saveSuccess) {
            console.error('AppTransition: Failed to save onboarding data after all attempts');
            setProcessingStep("Completando configuración...");
          }
        } else {
          console.log('AppTransition: No onboarding data found in localStorage');
          setProcessingStep("Preparando tu experiencia...");
        }
        
        // Mark as completed and redirect after a short delay
        if (isMounted) {
          setHasCompleted(true);
          setProcessingStep("¡Listo! Redirigiendo...");
          
          timeoutId = setTimeout(() => {
            if (isMounted) {
              console.log('AppTransition: Redirecting to home...');
              navigate("/");
            }
          }, 2000);
        }
        
      } catch (error) {
        console.error('AppTransition: Unexpected error during transition:', error);
        if (isMounted) {
          setProcessingStep("Finalizando...");
          timeoutId = setTimeout(() => {
            if (isMounted) {
              console.log('AppTransition: Redirecting to home after error...');
              navigate("/");
            }
          }, 2000);
        }
      }
    };

    // Start the process immediately, don't wait for auth loading to finish
    handleTransition();
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Only run once on mount
  
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
        {hasCompleted ? "¡Bienvenido a GatofitAI!" : "Preparando tu experiencia personalizada..."}
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-sm text-muted-foreground mb-8 text-center"
      >
        {processingStep}
      </motion.p>
      
      {saveAttempts > 1 && !hasCompleted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground mb-4 text-center"
        >
          Intento {saveAttempts} de 3
        </motion.p>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-16 h-16 flex justify-center items-center"
      >
        {hasCompleted ? (
          <div className="w-10 h-10 text-green-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
        ) : (
          <svg className="w-10 h-10 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
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
