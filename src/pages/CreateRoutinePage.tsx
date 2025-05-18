
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CreateRoutinePage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSelectExercises = () => {
    navigate("/workout/select-exercises");
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Crear Rutina</h1>
      
      <div className="animate-fade-in">
        <Card>
          <CardHeader title="Crear Nueva Rutina" />
          <CardBody>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la Rutina</label>
                <input 
                  type="text" 
                  placeholder="Ej: Día de Pierna" 
                  className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Rutina</label>
                <Select>
                  <SelectTrigger className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
                    <SelectValue placeholder="Seleccionar tipo" />
                    <ChevronDown className="h-4 w-4 text-primary" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
                    <SelectGroup>
                      <SelectItem value="strength">Fuerza</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibilidad</SelectItem>
                      <SelectItem value="mixed">Mixto</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                <textarea 
                  rows={3}
                  placeholder="Describe brevemente esta rutina..." 
                  className="w-full rounded-xl p-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button resize-none"
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="primary" 
                  fullWidth 
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={handleSelectExercises}
                >
                  Añadir Ejercicios
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CreateRoutinePage;
