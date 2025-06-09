
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Calendar, ArrowUpCircle, List, Calculator, BookOpenCheck } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import SwipeableCarousel from "@/components/onboarding/SwipeableCarousel";
import GatofitAILogo from "@/components/GatofitAILogo";
import { Skeleton } from "@/components/ui/skeleton";

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => {
  return (
    <motion.div 
      className="flex flex-col items-center p-4 rounded-2xl bg-secondary/20 shadow-neu-card text-center h-full"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(1);
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

  // Calculate cards per view based on screen size
  const getCardsPerView = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth > 768 ? 2 : 1;
    }
    return 1;
  };
  
  // Initialize component
  useEffect(() => {
    const initializeComponent = () => {
      setCardsPerView(getCardsPerView());
      // Small delay to ensure proper rendering
      setTimeout(() => {
        setIsLoaded(true);
      }, 100);
    };
    
    initializeComponent();
  }, []);
  
  // Update cards per view on resize
  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll carousel every 4 seconds (only when loaded)
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

  // Loading skeleton
  if (!isLoaded) {
    return (
      <OnboardingLayout currentStep={17} totalSteps={20}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full min-h-[calc(100vh-200px)]"
        >
          <h1 className="text-2xl font-bold mb-2">
            Descubre cómo <GatofitAILogo size="lg" className="inline-block" /> te impulsará
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Estas son algunas de las características clave que te ayudarán a alcanzar tus objetivos
          </p>

          <div className="w-full flex-1 flex flex-col justify-center">
            <div className="flex-grow">
              <div className="h-[calc(100%-30px)]">
                <div className="px-1 py-1 h-full">
                  <AspectRatio ratio={1/1} className="h-full max-w-[60vh] mx-auto">
                    <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary/20 shadow-neu-card text-center h-full">
                      <Skeleton className="h-12 w-12 rounded-xl mb-3" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-1" />
                    </div>
                  </AspectRatio>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <OnboardingNavigation 
          onNext={handleNext}
          nextLabel="Crear Cuenta"
        />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={17} totalSteps={20}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col h-full min-h-[calc(100vh-200px)]"
      >
        <h1 className="text-2xl font-bold mb-2">
          Descubre cómo <GatofitAILogo size="lg" className="inline-block" /> te impulsará
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Estas son algunas de las características clave que te ayudarán a alcanzar tus objetivos
        </p>

        <div className="w-full flex-1 flex flex-col justify-center">
          <div className="flex-grow">
            <SwipeableCarousel 
              autoScroll 
              autoScrollInterval={4000}
              currentSlide={currentSlide} 
              onSlideChange={setCurrentSlide}
              cardsPerView={cardsPerView}
              className="h-[calc(100%-30px)]"
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
        </div>
      </motion.div>

      <OnboardingNavigation 
        onNext={handleNext}
        nextLabel="Crear Cuenta"
      />
    </OnboardingLayout>
  );
};

export default FeaturesPreview;
