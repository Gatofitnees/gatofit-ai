
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const ProgressComparison: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  const [showAI, setShowAI] = useState(false);
  const [traditionalProgress, setTraditionalProgress] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  
  if (!context) {
    throw new Error("ProgressComparison must be used within OnboardingContext");
  }

  // Traditional app data points (low progress)
  const traditionalData = [0, 3, 5, 8, 10, 12];
  
  // AI app data points (high progress)
  const aiData = [0, 25, 45, 70, 88, 100];

  // Animate traditional line first
  useEffect(() => {
    const timer = setTimeout(() => {
      setTraditionalProgress(100);
      setTimeout(() => setShowAI(true), 800);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Animate AI line after traditional
  useEffect(() => {
    if (showAI) {
      const timer = setTimeout(() => {
        setAiProgress(100);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showAI]);

  const handleNext = () => {
    navigate("/onboarding/physical-data");
  };

  // Generate SVG path for line
  const createPath = (data: number[], progress: number) => {
    const width = 300;
    const height = 180;
    const padding = 40;
    
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (value / 100) * chartHeight;
      return `${x},${y}`;
    });
    
    // Calculate how much of the path to show based on progress
    const visiblePoints = Math.floor((points.length - 1) * (progress / 100)) + 1;
    const pathPoints = points.slice(0, visiblePoints);
    
    if (pathPoints.length < 2) return "";
    
    return `M ${pathPoints[0]} L ${pathPoints.slice(1).join(" L ")}`;
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

        <div className="flex-1 min-h-[300px] bg-background/40 rounded-xl p-4 border border-white/5 flex items-center justify-center">
          <svg width="320" height="200" className="w-full max-w-[320px]">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="320" height="200" fill="url(#grid)" />
            
            {/* Y-axis labels */}
            <text x="25" y="45" fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle">100%</text>
            <text x="25" y="110" fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle">50%</text>
            <text x="25" y="175" fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle">0%</text>
            
            {/* X-axis labels */}
            {[1, 2, 3, 4, 5, 6].map((month, index) => (
              <text 
                key={month}
                x={40 + (index / 5) * 240}
                y="195" 
                fill="hsl(var(--muted-foreground))" 
                fontSize="10" 
                textAnchor="middle"
              >
                M{month}
              </text>
            ))}
            
            {/* Traditional app line */}
            <motion.path
              d={createPath(traditionalData, traditionalProgress)}
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="3"
              strokeDasharray="8,4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: traditionalProgress / 100 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Traditional app dots */}
            {traditionalData.map((value, index) => {
              const x = 40 + (index / (traditionalData.length - 1)) * 240;
              const y = 40 + 120 - (value / 100) * 120;
              const shouldShow = index <= (traditionalData.length - 1) * (traditionalProgress / 100);
              
              return shouldShow ? (
                <motion.circle
                  key={`trad-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#9CA3AF"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.3, duration: 0.3 }}
                />
              ) : null;
            })}
            
            {/* AI app line */}
            {showAI && (
              <motion.path
                d={createPath(aiData, aiProgress)}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                filter="drop-shadow(0 0 6px hsl(var(--primary)/0.6))"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: aiProgress / 100 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            )}
            
            {/* AI app dots */}
            {showAI && aiData.map((value, index) => {
              const x = 40 + (index / (aiData.length - 1)) * 240;
              const y = 40 + 120 - (value / 100) * 120;
              const shouldShow = index <= (aiData.length - 1) * (aiProgress / 100);
              
              return shouldShow ? (
                <motion.circle
                  key={`ai-${index}`}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                  filter="drop-shadow(0 0 4px hsl(var(--primary)/0.5))"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.4, duration: 0.3 }}
                />
              ) : null;
            })}
          </svg>
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
