
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Colors for macro pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const InitialRecommendation: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("InitialRecommendation must be used within OnboardingContext");
  }

  const { data, updateData } = context;
  
  // Mock calculation of macros based on user data
  const [calculatedMacros, setCalculatedMacros] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  useEffect(() => {
    // Very simplified calculation for demo purposes
    // In a real app, this would be a more sophisticated algorithm
    let baseCals = 0;
    
    if (data.gender === "male") {
      baseCals = 2000;
    } else {
      baseCals = 1800;
    }
    
    // Adjust for weight
    if (data.weight) {
      baseCals += (data.weight - 70) * 10;
    }
    
    // Adjust for activity level
    baseCals += data.trainingsPerWeek * 100;
    
    // Adjust for goal
    if (data.mainGoal === "lose_weight") {
      baseCals -= 300;
    } else if (data.mainGoal === "gain_muscle") {
      baseCals += 200;
    }
    
    // Ensure reasonable range
    baseCals = Math.max(1200, Math.min(3000, baseCals));
    
    // Calculate macros
    const protein = Math.round(data.weight ? data.weight * 1.8 : 120);
    const fat = Math.round(baseCals * 0.25 / 9);
    const carbs = Math.round((baseCals - (protein * 4) - (fat * 9)) / 4);
    
    setCalculatedMacros({
      calories: Math.round(baseCals),
      protein,
      carbs,
      fat
    });
    
    // Store these in the onboarding context
    updateData({
      initial_recommended_calories: Math.round(baseCals),
      initial_recommended_protein_g: protein,
      initial_recommended_carbs_g: carbs,
      initial_recommended_fats_g: fat
    });
  }, []);
  
  const handleNext = () => {
    navigate("/onboarding/features-preview");
  };
  
  // Prepare data for pie chart
  const chartData = [
    { name: "Proteínas", value: calculatedMacros.protein * 4 },
    { name: "Carbohidratos", value: calculatedMacros.carbs * 4 },
    { name: "Grasas", value: calculatedMacros.fat * 9 }
  ];
  
  // Workout recommendation based on training frequency
  const getWorkoutRecommendation = () => {
    if (data.trainingsPerWeek <= 2) {
      return "Te recomendamos empezar con 2-3 sesiones de entrenamiento de cuerpo completo por semana.";
    } else if (data.trainingsPerWeek <= 4) {
      return "Te recomendamos 3-4 sesiones semanales, alternando entre entrenamiento de fuerza y cardio.";
    } else {
      return "Con tu nivel de compromiso, puedes seguir un plan de 5-6 días con entrenamientos divididos por grupos musculares.";
    }
  };

  return (
    <OnboardingLayout currentStep={16} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-4">Tu Punto de Partida Personalizado</h1>
      
      <p className="text-muted-foreground mb-6">
        Basado en tu información, estas son nuestras recomendaciones iniciales
      </p>

      <div className="space-y-6 w-full max-w-md mx-auto">
        {/* Macros donut chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-secondary/20 p-4 rounded-xl neu-card"
        >
          <h3 className="text-center font-medium mb-2">Distribución Diaria de Macros</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Calorías</p>
              <p className="font-bold">{calculatedMacros.calories}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground" style={{ color: COLORS[0] }}>Proteínas</p>
              <p className="font-bold">{calculatedMacros.protein}g</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground" style={{ color: COLORS[1] }}>Carbos</p>
              <p className="font-bold">{calculatedMacros.carbs}g</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground" style={{ color: COLORS[2] }}>Grasas</p>
              <p className="font-bold">{calculatedMacros.fat}g</p>
            </div>
          </div>
        </motion.div>
        
        {/* Workout recommendation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-secondary/20 p-4 rounded-xl neu-card"
        >
          <h3 className="font-medium mb-2">Recomendación de Entrenamiento</h3>
          <p className="text-sm text-muted-foreground">
            {getWorkoutRecommendation()}
          </p>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-xs text-center text-muted-foreground"
        >
          Estos son valores iniciales. GatofitAI los refinará a medida que aprendamos más de ti.
        </motion.p>
      </div>

      <OnboardingNavigation onNext={handleNext} />
    </OnboardingLayout>
  );
};

export default InitialRecommendation;
