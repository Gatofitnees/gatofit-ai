
import React from "react";
import { Calendar, ChevronRight, Plus } from "lucide-react";
import Avatar from "../components/Avatar";
import { Card, CardHeader, CardBody, CardFooter } from "../components/Card";
import Button from "../components/Button";
import MacroProgress from "../components/MacroProgress";

const HomePage: React.FC = () => {
  // Mock data
  const userProgress = 75;
  const username = "Carlos";
  
  const macros = {
    calories: { current: 1450, target: 2000, unit: "kcal" },
    protein: { current: 90, target: 120 },
    carbs: { current: 130, target: 200 },
    fats: { current: 35, target: 65 }
  };
  
  const nextWorkout = {
    name: "Full Body Force",
    time: "18:30",
    duration: "45 min"
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* User Greeting & Progress */}
      <div className="flex items-center mb-6 animate-fade-in">
        <Avatar 
          name={username} 
          progress={userProgress} 
          size="md" 
        />
        <div className="ml-4">
          <h1 className="text-xl font-bold">
            ¡Hola, <span className="text-gradient">{username}</span>!
          </h1>
          <p className="text-sm text-muted-foreground">
            {userProgress}% completado hoy
          </p>
        </div>
      </div>

      {/* Today's Workout Card */}
      <Card className="mb-5">
        <CardHeader 
          title="Mi Entrenamiento Hoy" 
          icon={<Calendar className="h-5 w-5" />} 
        />
        <CardBody>
          {nextWorkout ? (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{nextWorkout.name}</h4>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-muted-foreground mr-2">
                    {nextWorkout.time}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {nextWorkout.duration}
                  </span>
                </div>
              </div>
              <Button 
                variant="primary"
                size="sm"
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Iniciar
              </Button>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-sm text-muted-foreground">
                No hay entrenamientos programados para hoy
              </p>
              <Button 
                variant="outline"
                size="sm"
                className="mt-2"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Programar Entrenamiento
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Nutrition Progress Card */}
      <Card>
        <CardHeader 
          title="Mis Macros Hoy"
          subtitle="Resumen de objetivos nutricionales" 
        />
        <CardBody>
          <div className="space-y-4">
            <MacroProgress 
              label="Calorías" 
              current={macros.calories.current} 
              target={macros.calories.target} 
              unit={macros.calories.unit} 
            />
            <MacroProgress 
              label="Proteínas" 
              current={macros.protein.current} 
              target={macros.protein.target}
              color="protein" 
            />
            <MacroProgress 
              label="Carbohidratos" 
              current={macros.carbs.current} 
              target={macros.carbs.target}
              color="carbs" 
            />
            <MacroProgress 
              label="Grasas" 
              current={macros.fats.current} 
              target={macros.fats.target}
              color="fat" 
            />
          </div>
        </CardBody>
        <CardFooter className="flex justify-center">
          <Button 
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Añadir Comida
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HomePage;
