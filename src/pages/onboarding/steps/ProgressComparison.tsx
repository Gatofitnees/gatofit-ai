
import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const DATA_TRADITIONAL = [
  { month: 1, progress: 10 },
  { month: 2, progress: 18 },
  { month: 3, progress: 25 },
  { month: 4, progress: 32 },
  { month: 5, progress: 38 },
  { month: 6, progress: 43 },
];

const DATA_AI = [
  { month: 1, progress: 15 },
  { month: 2, progress: 30 },
  { month: 3, progress: 48 },
  { month: 4, progress: 65 },
  { month: 5, progress: 75 },
  { month: 6, progress: 90 },
];

const ProgressComparison: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("ProgressComparison must be used within OnboardingContext");
  }

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
            <LineChart data={DATA_TRADITIONAL} margin={{ top: 20, right: 30, left: 5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="month" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Meses', position: 'insideBottom', offset: -15, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Progreso', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
              />
              
              <Line 
                dataKey="progress"
                name="Apps Tradicionales"
                stroke="hsl(var(--muted))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={2000}
              />
              
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                <Line 
                  data={DATA_AI}
                  dataKey="progress"
                  name="GatofitAI"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={2500}
                  animationBegin={1000}
                />
              </motion.g>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-muted mr-2"></div>
            <span className="text-xs text-muted-foreground">Apps Tradicionales</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
            <span className="text-xs text-muted-foreground">GatofitAI</span>
          </div>
        </div>
      </div>

      <OnboardingNavigation onNext={handleNext} />
    </OnboardingLayout>
  );
};

export default ProgressComparison;
