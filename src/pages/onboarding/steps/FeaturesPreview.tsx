
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
    <motion.div 
      className="flex flex-col items-center p-4 rounded-2xl bg-secondary/20 shadow-neu-card text-center h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-primary/10 p-3 rounded-xl mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
};

const FeaturesPreview: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const context = useContext(OnboardingContext);
  const [isLoaded, setIsLoaded] = useState(false);
  
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

  // Set isLoaded to true after a small delay to prevent visual glitch on first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll carousel every 4 seconds
  useEffect(() => {
    if (!isLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [features.length, isLoaded]);

  const handleNext = () => {
    navigate("/onboarding/create-account");
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  // Calculate cards per view based on screen size
  const getCardsPerView = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth > 768 ? 2 : 1;
    }
    return 1;
  };
  
  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());
  
  // Update cards per view on resize
  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <OnboardingLayout currentStep={17} totalSteps={20}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col h-full"
      >
        <h1 className="text-2xl font-bold mb-2">
          Descubre cómo <GatofitAILogo size="lg" className="inline-block" /> te impulsará
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Estas son algunas de las características clave que te ayudarán a alcanzar tus objetivos
        </p>

        <div className="w-full flex-1 flex flex-col justify-between">
          {isLoaded && (
            <div className="flex-grow">
              <SwipeableCarousel 
                autoScroll 
                autoScrollInterval={4000}
                currentSlide={currentSlide} 
                onSlideChange={setCurrentSlide}
                cardsPerView={cardsPerView}
                className="h-[calc(100%-30px)]" // Ensure full height minus indicators
              >
                {features.map((feature, index) => (
                  <div key={index} className="px-1 py-1 h-full">
                    <AspectRatio ratio={1/1} className="h-full max-w-[60vh] mx-auto">
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
          )}
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
      </motion.div>
    </OnboardingLayout>
  );
};

export default FeaturesPreview;
