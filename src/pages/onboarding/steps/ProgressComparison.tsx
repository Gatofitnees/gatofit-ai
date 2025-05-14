
import React, { useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const DATA_TRADITIONAL = [
  { month: 1, progress: 0, label: "Mes 1" },
  { month: 2, progress: 10, label: "Mes 2" },
  { month: 3, progress: 18, label: "Mes 3" },
  { month: 4, progress: 25, label: "Mes 4" },
  { month: 5, progress: 32, label: "Mes 5" },
  { month: 6, progress: 38, label: "Mes 6" },
];

const DATA_AI = [
  { month: 1, progress: 0, label: "Mes 1" },
  { month: 2, progress: 15, label: "Mes 2" },
  { month: 3, progress: 30, label: "Mes 3" },
  { month: 4, progress: 48, label: "Mes 4" },
  { month: 5, progress: 65, label: "Mes 5" },
  { month: 6, progress: 90, label: "Mes 6" },
];

const ProgressComparison: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  // Animation state
  const [showAI, setShowAI] = React.useState(false);
  const [traditionalData, setTraditionalData] = React.useState(
    DATA_TRADITIONAL.map(item => ({ ...item, progress: 0 }))
  );
  const [aiData, setAiData] = React.useState(
    DATA_AI.map(item => ({ ...item, progress: 0 }))
  );
  
  if (!context) {
    throw new Error("ProgressComparison must be used within OnboardingContext");
  }

  // Animate the traditional line when component mounts
  useEffect(() => {
    const animateTraditionalLine = () => {
      const duration = 1500; // Animation duration in ms
      const steps = 30; // Number of animation steps
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      
      const interval = setInterval(() => {
        const progress = currentStep / steps;
        const updatedData = DATA_TRADITIONAL.map((item, index) => ({
          ...item,
          progress: progress * item.progress
        }));
        
        setTraditionalData(updatedData);
        currentStep++;
        
        if (currentStep > steps) {
          clearInterval(interval);
          setTimeout(() => setShowAI(true), 500);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    };
    
    animateTraditionalLine();
  }, []);
  
  // Animate the AI line after traditional line is complete
  useEffect(() => {
    if (showAI) {
      const animateAILine = () => {
        const duration = 1500; // Animation duration in ms
        const steps = 30; // Number of animation steps
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        
        const interval = setInterval(() => {
          const progress = currentStep / steps;
          const updatedData = DATA_AI.map((item, index) => ({
            ...item,
            progress: progress * item.progress
          }));
          
          setAiData(updatedData);
          currentStep++;
          
          if (currentStep > steps) {
            clearInterval(interval);
          }
        }, stepDuration);
        
        return () => clearInterval(interval);
      };
      
      animateAILine();
    }
  }, [showAI]);

  const handleNext = () => {
    navigate("/onboarding/physical-data");
  };

  return (
    <OnboardingLayout currentStep={5} totalSteps={20}>
      <div className="flex-1 flex flex-col">
        <h1 className="text-2xl font-bold mb-2">
          Con GatofitAI, tu progreso se acelera.
        </h1>

        <p className="text-muted-foreground mb-6">
          Nuestra IA personaliza tu plan para resultados óptimos.
        </p>

        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 20, right: 30, left: 5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="label" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Tiempo', position: 'insideBottom', offset: -15, fill: 'hsl(var(--muted-foreground))' }}
                scale="point"
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Progreso', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                domain={[0, 100]}
              />
              
              <Line 
                data={traditionalData}
                type="monotone"
                dataKey="progress"
                name="Apps Tradicionales"
                stroke="hsl(var(--muted))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              
              {showAI && (
                <Line 
                  data={aiData}
                  type="monotone"
                  dataKey="progress"
                  name="GatofitAI"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-muted mr-2"></div>
            <span className="text-xs text-muted-foreground">Apps Tradicionales</span>
          </div>
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: showAI ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
            <span className="text-xs text-muted-foreground">GatofitAI</span>
          </motion.div>
        </div>
      </div>

      <OnboardingNavigation onNext={handleNext} />
    </OnboardingLayout>
  );
};

export default ProgressComparison;
