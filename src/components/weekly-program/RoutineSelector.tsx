
import React, { useState } from "react";
import { Search, Clock, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoutines } from "@/hooks/useRoutines";

interface RoutineSelectorProps {
  onSelectRoutine: (routineId: number) => void;
  onClose: () => void;
  selectedRoutines?: number[];
}

const RoutineSelector: React.FC<RoutineSelectorProps> = ({
  onSelectRoutine,
  onClose,
  selectedRoutines = []
}) => {
  const { routines, loading } = useRoutines();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoutines = routines.filter(routine =>
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Seleccionar Rutina</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar rutinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando rutinas...</p>
            </div>
          ) : filteredRoutines.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No se encontraron rutinas' : 'No tienes rutinas creadas'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className="p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer bg-card hover:bg-secondary/50"
                  onClick={() => {
                    onSelectRoutine(routine.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{routine.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {routine.type && (
                          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                            {routine.type}
                          </span>
                        )}
                        {routine.estimated_duration_minutes && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDuration(routine.estimated_duration_minutes)}
                          </div>
                        )}
                        {routine.exercise_count && (
                          <span className="text-xs text-muted-foreground">
                            {routine.exercise_count} ejercicios
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {selectedRoutines.includes(routine.id) && (
                      <div className="text-xs text-primary font-medium">
                        Seleccionada
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineSelector;
