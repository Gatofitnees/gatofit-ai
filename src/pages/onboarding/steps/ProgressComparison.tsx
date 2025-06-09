
import React, { useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const DATA_TRADITIONAL = [
  { month: 1, progress: 0, label: "Mes 1" },
  { month: 2, progress: 3, label: "Mes 2" },
  { month: 3, progress: 5, label: "Mes 3" },
  { month: 4, progress: 8, label: "Mes 4" },
  { month: 5, progress: 10, label: "Mes 5" },
  { month: 6, progress: 12, label: "Mes 6" },
];

const DATA_AI = [
  { month: 1, progress: 0, label: "Mes 1" },
  { month: 2, progress: 25, label: "Mes 2" },
  { month: 3, progress: 45, label: "Mes 3" },
  { month: 4, progress: 70, label: "Mes 4" },
  { month: 5, progress: 88, label: "Mes 5" },
  { month: 6, progress: 100, label: "Mes 6" },
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
      const duration = 1800;
      const steps = 40;
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
          setTimeout(() => setShowAI(true), 800);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    };
    
    const timer = setTimeout(animateTraditionalLine, 300);
    return () => clearTimeout(timer);
  }, []);
  
  // Animate the AI line after traditional line is complete
  useEffect(() => {
    if (showAI) {
      const animateAILine = () => {
        const duration = 2000;
        const steps = 50;
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
      <div className="flex-1 flex flex-col min-h-[calc(100vh-200px)]">
        <h1 className="text-2xl font-bold mb-2">
          Con GatofitAI, tu progreso se acelera.
        </h1>

        <p className="text-muted-foreground mb-6">
          Nuestra IA personaliza tu plan para resultados óptimos.
        </p>

        <div className="flex-1 min-h-[300px] bg-background/40 rounded-xl p-4 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="label" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Tiempo', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
                scale="point"
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Progreso (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                domain={[0, 100]}
              />
              
              <Line 
                data={traditionalData}
                type="monotone"
                dataKey="progress"
                name="Apps Tradicionales"
                stroke="#9CA3AF"
                strokeWidth={3}
                dot={{ fill: "#9CA3AF", strokeWidth: 0, r: 4 }}
                strokeDasharray="8,4"
                isAnimationActive={false}
              />
              
              {showAI && (
                <Line 
                  data={aiData}
                  type="monotone"
                  dataKey="progress"
                  name="GatofitAI"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))", r: 5 }}
                  filter="drop-shadow(0 0 6px hsl(var(--primary)/0.6))"
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-8 mb-6 mt-4">
          <div className="flex items-center">
            <div className="w-6 h-0.5 bg-[#9CA3AF] mr-3" style={{ backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 4px, #9CA3AF 4px, #9CA3AF 12px)' }}></div>
            <span className="text-sm text-muted-foreground">Apps Tradicionales</span>
          </div>
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: showAI ? 1 : 0, scale: showAI ? 1 : 0.9 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-6 h-1 bg-primary mr-3 rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.5)]"></div>
            <span className="text-sm font-medium text-primary">GatofitAI</span>
          </motion.div>
        </div>
      </div>

      <OnboardingNavigation onNext={handleNext} />
    </OnboardingLayout>
  );
};

export default ProgressComparison;
