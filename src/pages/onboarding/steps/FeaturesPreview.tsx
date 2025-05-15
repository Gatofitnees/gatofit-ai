
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Calendar, ArrowUpCircle, List, Calculator, BookOpenCheck, ArrowLeft } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { OnboardingContext } from "../OnboardingFlow";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import SwipeableCarousel from "@/components/onboarding/SwipeableCarousel";
import GatofitAILogo from "@/components/GatofitAILogo";

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary/20 shadow-neu-card text-center h-full">
      <div className="bg-primary/10 p-3 rounded-xl mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  );
};

const FeaturesPreview: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("FeaturesPreview must be used within OnboardingContext");
  }

  const features = [
    {
      title: "Planes de Entrenamiento Personalizados",
      description: "Rutinas adaptadas a tus objetivos, nivel de experiencia y preferencias.",
      icon: <Calendar size={24} className="text-primary" />,
    },
    {
      title: "Seguimiento Nutricional Inteligente",
      description: "Controla macros y calorías con un sistema inteligente que aprende de tus hábitos.",
      icon: <Calculator size={24} className="text-primary" />,
    },
    {
      title: "Análisis de Progreso",
      description: "Visualiza tu evolución con gráficos detallados y métricas personalizadas.",
      icon: <BarChart3 size={24} className="text-primary" />,
    },
    {
      title: "Logros y Retos",
      description: "Mantén tu motivación con desafíos adaptados a tu nivel y celebra tus victorias.",
      icon: <ArrowUpCircle size={24} className="text-primary" />,
    },
    {
      title: "Biblioteca de Ejercicios",
      description: "Accede a cientos de ejercicios con guías detalladas y videos demostrativos.",
      icon: <BookOpenCheck size={24} className="text-primary" />,
    },
    {
      title: "Planes de Comidas",
      description: "Descubre recetas saludables que se alinean con tus objetivos nutricionales.",
      icon: <List size={24} className="text-primary" />,
    },
  ];

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  const handleNext = () => {
    navigate("/onboarding/create-account");
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <OnboardingLayout currentStep={17} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-2">
        Descubre cómo <GatofitAILogo size="lg" className="inline-block" /> te impulsará
      </h1>
      
      <p className="text-muted-foreground mb-6">
        Estas son algunas de las características clave que te ayudarán a alcanzar tus objetivos
      </p>

      <div className="w-full flex-1 flex flex-col justify-between">
        <div className="flex-grow">
          <SwipeableCarousel autoScroll currentSlide={currentSlide} onSlideChange={setCurrentSlide}>
            {features.map((feature, index) => (
              <div key={index} className="px-1 py-1">
                <AspectRatio ratio={3/4}>
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                  />
                </AspectRatio>
              </div>
            ))}
          </SwipeableCarousel>
        </div>
      </div>

      <div className="w-full mt-8 space-y-4">
        <motion.button
          className="w-full flex items-center justify-center py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl text-center neu-button"
          onClick={handleNext}
          whileTap={{ scale: 0.98 }}
        >
          <span>Crear Cuenta</span>
        </motion.button>
        
        <button
          onClick={handleBack}
          className="flex items-center justify-center py-2 w-full text-sm text-muted-foreground"
        >
          <ArrowLeft size={16} className="mr-2" />
          Atrás
        </button>
      </div>
    </OnboardingLayout>
  );
};

export default FeaturesPreview;
