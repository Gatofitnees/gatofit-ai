
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/Button";
import UserHeader from "../components/UserHeader";
import DaySelector from "../components/DaySelector";
import TrainingCard from "../components/TrainingCard";
import MacrosCard from "../components/MacrosCard";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasCompletedWorkout, setHasCompletedWorkout] = useState(false);
  
  // Datos de ejemplo - En una implementación real vendrían de Supabase
  const username = user?.user_metadata?.name || user?.email?.split('@')[0] || "Usuario";
  const userProgress = 75;
  
  const macros = {
    calories: { current: 1450, target: 2000, unit: "kcal" },
    protein: { current: 90, target: 120 },
    carbs: { current: 130, target: 200 },
    fats: { current: 35, target: 65 }
  };
  
  const completedWorkout = hasCompletedWorkout ? {
    name: "Full Body Force",
    duration: "45 min",
    calories: 320,
    exercises: ["Press Banca", "Sentadillas", "Pull-ups"]
  } : undefined;

  // En una implementación real, esto cargaría los datos de Supabase
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Aquí se cargarían los datos de entreno y alimentación para la fecha seleccionada
    
    // Simulamos datos de ejemplo aleatorios
    if (Math.random() > 0.5) {
      setHasCompletedWorkout(true);
    } else {
      setHasCompletedWorkout(false);
    }
  };

  const handleStartWorkout = () => {
    toast({
      title: "Iniciar entrenamiento",
      description: "Redirigiendo a la página de entrenamiento...",
    });
    navigate("/workout");
  };

  const handleAddFood = () => {
    toast({
      title: "Añadir comida",
      description: "Redirigiendo a la página de nutrición...",
    });
    navigate("/nutrition");
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Encabezado y perfil de usuario */}
      <UserHeader 
        username={username} 
        progress={userProgress}
      />
      
      {/* Selector de días */}
      <DaySelector 
        onSelectDate={handleDateSelect}
        datesWithRecords={[
          new Date(),
          new Date(new Date().setDate(new Date().getDate() - 2)),
          new Date(new Date().setDate(new Date().getDate() - 5))
        ]}
      />

      {/* Tarjeta de Entrenamiento */}
      <TrainingCard
        completed={hasCompletedWorkout}
        workout={completedWorkout}
        onStartWorkout={handleStartWorkout}
        onViewDetails={() => toast({
          title: "Detalles del entrenamiento",
          description: "Mostrando detalles del entrenamiento...",
        })}
      />
      
      {/* Tarjeta de Macros */}
      <MacrosCard 
        macros={macros} 
        onAddFood={handleAddFood}
      />
    </div>
  );
};

export default HomePage;
