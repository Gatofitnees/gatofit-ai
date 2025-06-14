import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { useToast } from "@/hooks/use-toast";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

const AppTransition: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentStatus, setCurrentStatus] = useState("Configurando tu cuenta...");
  
  const { 
    handleGoogleAuthData, 
    saveOnboardingToProfile, 
    loadOnboardingData,
    clearOnboardingData 
  } = useOnboardingPersistence();

  useEffect(() => {
    const processTransition = async () => {
      console.log('AppTransition: Starting transition process');
      setIsProcessing(true);
      
      // Wait for auth to complete if still loading
      if (authLoading) {
        console.log('AppTransition: Waiting for auth to complete...');
        setCurrentStatus("Verificando autenticación...");
        return;
      }

      // If no user, redirect to welcome
      if (!user) {
        console.log('AppTransition: No user found, redirecting to welcome');
        navigate("/onboarding/welcome");
        return;
      }

      console.log('AppTransition: User authenticated:', user.id);
      setCurrentStatus("Guardando tus datos...");

      let saveSuccess = false;

      try {
        // First, try to handle Google auth data if it exists
        console.log('AppTransition: Checking for Google auth data...');
        const googleAuthResult = await handleGoogleAuthData();
        
        if (googleAuthResult) {
          console.log('AppTransition: Google auth data processed successfully');
          saveSuccess = true;
        } else {
          console.log('AppTransition: No Google auth data or processing failed, trying regular onboarding data...');
          
          // If no Google auth data, try regular onboarding data
          const onboardingData = loadOnboardingData();
          
          if (onboardingData) {
            console.log('AppTransition: Found regular onboarding data, attempting to save...');
            saveSuccess = await saveOnboardingToProfile(onboardingData);
            
            if (saveSuccess) {
              console.log('AppTransition: Regular onboarding data saved successfully');
            } else {
              console.log('AppTransition: Failed to save regular onboarding data');
            }
          } else {
            console.log('AppTransition: No onboarding data found');
            // If no data to save, consider it successful to avoid blocking the user
            saveSuccess = true;
          }
        }

        // Show appropriate messages
        if (saveSuccess) {
          setCurrentStatus("¡Configuración completada!");
          toast({
            title: "¡Bienvenido a GatofitAI!",
            description: "Tu perfil ha sido configurado exitosamente",
          });
          
          // Wait a moment before redirecting
          setTimeout(() => {
            console.log('AppTransition: Redirecting to home...');
            navigate("/");
          }, 1500);
        } else {
          console.error('AppTransition: Failed to save onboarding data');
          setCurrentStatus("Finalizando configuración...");
          toast({
            title: "Configuración parcial",
            description: "Algunos datos no se pudieron guardar, pero puedes completarlos desde tu perfil",
            variant: "default"
          });
          
          // Still redirect to avoid blocking the user
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }

      } catch (error) {
        console.error('AppTransition: Error during transition process:', error);
        setCurrentStatus("Finalizando...");
        
        toast({
          title: "Proceso completado",
          description: "Puedes completar tu configuración desde el perfil si es necesario",
          variant: "default"
        });
        
        // Don't block the user, redirect anyway
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processTransition();
  }, [user, authLoading, navigate, handleGoogleAuthData, saveOnboardingToProfile, loadOnboardingData, toast]);

  return (
    <OnboardingLayout currentStep={20} totalSteps={20}>
      <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[400px]">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">¡Ya casi estamos listos!</h1>
          <p className="text-muted-foreground">{currentStatus}</p>
        </div>
        
        {isProcessing && (
          <div className="max-w-md text-sm text-muted-foreground space-y-2">
            <p>• Configurando tu perfil personalizado</p>
            <p>• Calculando tus recomendaciones nutricionales</p>
            <p>• Preparando tu experiencia fitness</p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default AppTransition;
