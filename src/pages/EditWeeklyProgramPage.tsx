
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WeeklyProgramCalendar from "@/components/weekly-program/WeeklyProgramCalendar";
import RoutineSelector from "@/components/weekly-program/RoutineSelector";
import { useWeeklyPrograms } from "@/hooks/useWeeklyPrograms";
import { useWeeklyProgramRoutines } from "@/hooks/useWeeklyProgramRoutines";

const EditWeeklyProgramPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { programs, updateProgram, deleteProgram } = useWeeklyPrograms();
  const { routines, addRoutineToProgram, removeRoutineFromProgram, loading } = useWeeklyProgramRoutines(programId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [showRoutineSelector, setShowRoutineSelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const program = programs.find(p => p.id === programId);

  useEffect(() => {
    if (program) {
      setName(program.name);
      setDescription(program.description || "");
    }
  }, [program]);

  const handleAddRoutine = (dayOfWeek: number) => {
    setSelectedDay(dayOfWeek);
    setShowRoutineSelector(true);
  };

  const handleSelectRoutine = async (routineId: number) => {
    if (selectedDay === null || !programId) return;

    const success = await addRoutineToProgram(routineId, selectedDay);
    if (success) {
      setSelectedDay(null);
    }
  };

  const handleRemoveRoutine = async (programRoutineId: string) => {
    await removeRoutineFromProgram(programRoutineId);
  };

  const handleSave = async () => {
    if (!name.trim() || !programId) {
      alert("El nombre de la programación es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const success = await updateProgram(programId, {
        name: name.trim(),
        description: description.trim() || undefined
      });
      
      if (success) {
        navigate(`/workout/programs/view/${programId}`);
      }
    } catch (error) {
      console.error("Error updating program:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!programId || !program) return;

    if (window.confirm(`¿Estás seguro de que quieres eliminar la programación "${program.name}"?`)) {
      const success = await deleteProgram(programId);
      if (success) {
        navigate("/workout/programs");
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!program) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Programación no encontrada</p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/workout/programs")}
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Editar Programación</h1>
            <p className="text-sm text-muted-foreground">
              Modifica tu rutina semanal
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="text-red-500 border-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
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
              {routines.length} rutinas asignadas
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando programación...</p>
            </div>
          ) : (
            <WeeklyProgramCalendar
              routines={routines}
              onAddRoutine={handleAddRoutine}
              onRemoveRoutine={handleRemoveRoutine}
            />
          )}
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
                Guardar Cambios
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
          selectedRoutines={routines.map(r => r.routine_id)}
        />
      )}
    </div>
  );
};

export default EditWeeklyProgramPage;
