
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";

// Feature cards
const features = [
  {
    title: "Entrenamientos IA Inteligentes",
    description: "Rutinas personalizadas que se adaptan a tu progreso, equipamiento y tiempo disponible.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19H20M4 5H20M9 12H15M6 9L6 15M18 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Registro de Comidas por Foto",
    description: "Toma una foto de tu comida y nuestra IA identificará los alimentos y calculará los macros automáticamente.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9C3 7.89543 3.89543 7 5 7H5.92963C6.59834 7 7.2228 6.6658 7.59373 6.1094L8.40627 4.8906C8.7772 4.3342 9.40166 4 10.0704 4H13.9296C14.5983 4 15.2228 4.3342 15.5937 4.8906L16.4063 6.1094C16.7772 6.6658 17.4017 7 18.0704 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Seguimiento Avanzado de Progreso",
    description: "Analíticas detalladas de tu rendimiento, cambios corporales y nutrición para optimizar tus resultados.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M21 7L15.5657 12.4343C15.3677 12.6323 15.2687 12.7313 15.1545 12.7684C15.0541 12.8015 14.9459 12.8015 14.8455 12.7684C14.7313 12.7313 14.6323 12.6323 14.4343 12.4343L12.5657 10.5657C12.3677 10.3677 12.2687 10.2687 12.1545 10.2316C12.0541 10.1985 11.9459 10.1985 11.8455 10.2316C11.7313 10.2687 11.6323 10.3677 11.4343 10.5657L7 15M21 7H17M21 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  }
];

const FeaturesPreview: React.FC = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    navigate("/onboarding/create-account");
  };

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % features.length);
  };

  const prevSlide = () => {
    setActiveIndex((current) => (current - 1 + features.length) % features.length);
  };

  return (
    <OnboardingLayout currentStep={17} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-4">Descubre cómo GatofitAI te impulsará:</h1>

      {/* Carousel */}
      <div className="relative flex-1 w-full max-w-md mx-auto">
        <div className="h-full flex items-center justify-center">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="bg-secondary/20 rounded-xl neu-card p-6 text-center w-full"
          >
            <div className="text-primary mb-4 flex justify-center">
              {features[activeIndex].icon}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {features[activeIndex].title}
            </h3>
            
            <p className="text-muted-foreground text-sm">
              {features[activeIndex].description}
            </p>
          </motion.div>
        </div>

        {/* Navigation dots */}
        <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-2">
          {features.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeIndex ? "bg-primary w-4" : "bg-muted"
              }`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
        
        {/* Prev/Next buttons */}
        <button 
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 rounded-full bg-secondary/20 neu-button flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-8 h-8 rounded-full bg-secondary/20 neu-button flex items-center justify-center"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <OnboardingNavigation onNext={handleNext} />
    </OnboardingLayout>
  );
};

export default FeaturesPreview;
