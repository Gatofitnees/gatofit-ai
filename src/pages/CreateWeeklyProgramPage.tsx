
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WeeklyProgramCalendar from "@/components/weekly-program/WeeklyProgramCalendar";
import RoutineSelector from "@/components/weekly-program/RoutineSelector";
import { useWeeklyPrograms } from "@/hooks/useWeeklyPrograms";
import { useWeeklyProgramRoutines } from "@/hooks/useWeeklyProgramRoutines";

// Local type for temporary routines before saving
interface LocalWeeklyProgramRoutine {
  id: string;
  routine_id: number;
  day_of_week: number;
  order_in_day: number;
  routine?: {
    id: number;
    name: string;
    type?: string;
    estimated_duration_minutes?: number;
  };
}

const CreateWeeklyProgramPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProgram } = useWeeklyPrograms();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [showRoutineSelector, setShowRoutineSelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Local state for managing routines before saving
  const [localRoutines, setLocalRoutines] = useState<LocalWeeklyProgramRoutine[]>([]);

  const { routines: userRoutines } = useWeeklyProgramRoutines();

  const handleAddRoutine = (dayOfWeek: number) => {
    setSelectedDay(dayOfWeek);
    setShowRoutineSelector(true);
  };

  const handleSelectRoutine = async (routineId: number) => {
    if (selectedDay === null) return;

    // Find routine details from user routines (we'll need to get this from somewhere)
    // For now, create a placeholder routine entry
    const newRoutine: LocalWeeklyProgramRoutine = {
      id: `temp-${Date.now()}`,
      routine_id: routineId,
      day_of_week: selectedDay,
      order_in_day: localRoutines.filter(r => r.day_of_week === selectedDay).length,
      routine: {
        id: routineId,
        name: `Rutina ${routineId}`, // This should come from actual routine data
        type: 'General',
        estimated_duration_minutes: 60
      }
    };

    setLocalRoutines(prev => [...prev, newRoutine]);
    setSelectedDay(null);
  };

  const handleRemoveRoutine = (routineId: string) => {
    setLocalRoutines(prev => prev.filter(r => r.id !== routineId));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("El nombre de la programación es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const program = await createProgram(name.trim(), description.trim() || undefined);
      if (program) {
        // Here we would save the routines to the program
        // For now, just navigate back
        navigate("/workout/programs");
      }
    } catch (error) {
      console.error("Error saving program:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Nueva Programación</h1>
            <p className="text-sm text-muted-foreground">
              Organiza tus rutinas por días
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de la programación *
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Rutina de Volumen"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción (opcional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu programación semanal..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        {/* Weekly Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Programación Semanal</h2>
            <span className="text-sm text-muted-foreground">
              {localRoutines.length} rutinas asignadas
            </span>
          </div>
          
          <WeeklyProgramCalendar
            routines={localRoutines as any} // Type assertion for compatibility
            onAddRoutine={handleAddRoutine}
            onRemoveRoutine={handleRemoveRoutine}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-purple-500 hover:bg-purple-600"
            disabled={saving || !name.trim()}
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Routine Selector Modal */}
      {showRoutineSelector && (
        <RoutineSelector
          onSelectRoutine={handleSelectRoutine}
          onClose={() => {
            setShowRoutineSelector(false);
            setSelectedDay(null);
          }}
          selectedRoutines={localRoutines.map(r => r.routine_id)}
        />
      )}
    </div>
  );
};

export default CreateWeeklyProgramPage;
