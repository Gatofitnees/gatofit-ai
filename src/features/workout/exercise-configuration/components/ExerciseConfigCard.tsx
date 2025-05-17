
import React from "react";
import { Trash2, GripVertical, PlusCircle, MinusCircle } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfiguredExercise } from "../types";

interface ExerciseConfigCardProps {
  exercise: ConfiguredExercise;
  index: number;
  onUpdate: (index: number, data: Partial<ConfiguredExercise>) => void;
  onRemove: (index: number) => void;
}

const ExerciseConfigCard: React.FC<ExerciseConfigCardProps> = ({ 
  exercise, 
  index, 
  onUpdate, 
  onRemove 
}) => {
  return (
    <Card className="hover:shadow-neu-hover transition-all">
      <CardBody>
        <div className="flex items-start mb-2">
          <div className="w-6 flex-shrink-0 mr-2 text-muted-foreground">
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{exercise.name}</h3>
            <span className="text-xs text-muted-foreground">{exercise.muscle_group_main}</span>
            
            <div className="space-y-4 mt-4">
              {/* Series */}
              <div>
                <label className="text-xs text-muted-foreground">Series</label>
                <div className="flex items-center mt-1">
                  <button 
                    className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                    onClick={() => onUpdate(index, { sets: Math.max(1, exercise.sets - 1) })}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                  <span className="mx-4 font-medium w-8 text-center">{exercise.sets}</span>
                  <button 
                    className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                    onClick={() => onUpdate(index, { sets: exercise.sets + 1 })}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Toggle between Reps and Time */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  {exercise.is_time_based ? "Basado en Tiempo" : "Basado en Repeticiones"}
                </label>
                <Switch 
                  checked={exercise.is_time_based}
                  onCheckedChange={(checked) => onUpdate(index, { 
                    is_time_based: checked,
                    // Initialize duration if switching to time-based
                    duration_seconds: checked ? 30 : undefined
                  })}
                />
              </div>
              
              {/* Repetitions or Duration */}
              {exercise.is_time_based ? (
                <div>
                  <label className="text-xs text-muted-foreground">Duración (segundos)</label>
                  <div className="flex items-center mt-1">
                    <button 
                      className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                      onClick={() => onUpdate(index, { 
                        duration_seconds: Math.max(5, (exercise.duration_seconds || 30) - 5) 
                      })}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </button>
                    <span className="mx-4 font-medium w-8 text-center">
                      {exercise.duration_seconds || 30}
                    </span>
                    <button 
                      className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                      onClick={() => onUpdate(index, { 
                        duration_seconds: (exercise.duration_seconds || 30) + 5 
                      })}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-muted-foreground">Repeticiones (min-max)</label>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      <button 
                        className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                        onClick={() => onUpdate(index, { 
                          reps_min: Math.max(1, exercise.reps_min - 1) 
                        })}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </button>
                      <span className="mx-2 font-medium w-6 text-center">{exercise.reps_min}</span>
                      <button 
                        className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                        onClick={() => onUpdate(index, { 
                          reps_min: Math.min(exercise.reps_max, exercise.reps_min + 1) 
                        })}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="mx-2 text-muted-foreground">-</span>
                    <div className="flex items-center">
                      <button 
                        className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                        onClick={() => onUpdate(index, { 
                          reps_max: Math.max(exercise.reps_min, exercise.reps_max - 1) 
                        })}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </button>
                      <span className="mx-2 font-medium w-6 text-center">{exercise.reps_max}</span>
                      <button 
                        className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                        onClick={() => onUpdate(index, { reps_max: exercise.reps_max + 1 })}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Rest time */}
              <div>
                <label className="text-xs text-muted-foreground">Descanso (segundos)</label>
                <div className="flex items-center mt-1">
                  <button 
                    className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                    onClick={() => onUpdate(index, { 
                      rest_seconds: Math.max(0, exercise.rest_seconds - 15) 
                    })}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                  <span className="mx-4 font-medium w-10 text-center">
                    {exercise.rest_seconds}
                  </span>
                  <button 
                    className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                    onClick={() => onUpdate(index, { rest_seconds: exercise.rest_seconds + 15 })}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label className="text-xs text-muted-foreground">Notas (opcional)</label>
                <Textarea 
                  value={exercise.notes || ""}
                  onChange={(e) => onUpdate(index, { notes: e.target.value })}
                  placeholder="Añade instrucciones o notas para este ejercicio..."
                  className="mt-1 bg-secondary/30 border-none resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <button 
            className="ml-2 p-1 rounded-lg text-destructive hover:bg-secondary/50"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ExerciseConfigCard;
