
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Plus, Search, Dumbbell, Clock } from "lucide-react";
import { Card, CardBody } from "../components/Card";
import Button from "../components/Button";
import { supabase } from "@/integrations/supabase/client";

interface WorkoutRoutine {
  id: string;
  name: string;
  type: string;
  duration: string;
  exercises: number;
}

const WorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data
  const routines: WorkoutRoutine[] = [
    {
      id: "1",
      name: "Full Body Force",
      type: "Fuerza",
      duration: "45 min",
      exercises: 8
    },
    {
      id: "2",
      name: "HIIT Quemagrasa",
      type: "Cardio",
      duration: "30 min",
      exercises: 12
    },
    {
      id: "3",
      name: "Día de Pierna",
      type: "Fuerza",
      duration: "50 min",
      exercises: 7
    },
    {
      id: "4",
      name: "Core Express",
      type: "Fuerza",
      duration: "20 min",
      exercises: 6
    }
  ];

  const handleCreateRoutine = () => {
    navigate("/workout/create");
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Mis Rutinas</h1>
      
      {/* Search and Filter */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar rutinas..." 
            className="w-full h-10 rounded-xl pl-10 pr-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
          />
        </div>
        <Button 
          variant="secondary"
          size="sm"
          leftIcon={<Filter className="h-4 w-4" />}
        >
          Filtrar
        </Button>
      </div>

      {/* Routines List */}
      <div className="space-y-4">
        {routines.map((routine) => (
          <Card key={routine.id} className="hover:scale-[1.01] transition-transform duration-300">
            <CardBody>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{routine.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {routine.type}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {routine.duration}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {routine.exercises} ejercicios
                    </span>
                  </div>
                </div>
                <Button variant="primary" size="sm">
                  Iniciar
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}

        <Button
          variant="secondary"
          fullWidth
          className="mt-4"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleCreateRoutine}
        >
          Crear Nueva Rutina
        </Button>
      </div>
    </div>
  );
};

export default WorkoutPage;
