
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Plus, Save, Trash2, Grip, MoreVertical } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "@/components/Button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ExerciseItem {
  id: string;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
}

interface ExerciseSet {
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

interface RoutineExercise extends ExerciseItem {
  sets: ExerciseSet[];
}

const CreateRoutinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [routineName, setRoutineName] = useState("");
  const [routineType, setRoutineType] = useState("");
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNoExercisesDialog, setShowNoExercisesDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showExerciseOptionsSheet, setShowExerciseOptionsSheet] = useState(false);
  const [showReorderSheet, setShowReorderSheet] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    type: false,
  });
  
  // Load selected exercises from location state when available
  useEffect(() => {
    if (location.state && location.state.selectedExercises) {
      const exercises = location.state.selectedExercises.map((exercise: ExerciseItem) => ({
        ...exercise,
        sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
      }));
      setRoutineExercises(exercises);
    }
  }, [location.state]);
  
  const handleSelectExercises = () => {
    navigate("/workout/select-exercises");
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...routineExercises];
    const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    
    updatedExercises[exerciseIndex].sets.push({
      reps_min: lastSet.reps_min,
      reps_max: lastSet.reps_max,
      rest_seconds: lastSet.rest_seconds
    });
    
    setRoutineExercises(updatedExercises);
  };

  const handleSetUpdate = (exerciseIndex: number, setIndex: number, field: string, value: number) => {
    const updatedExercises = [...routineExercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setRoutineExercises(updatedExercises);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...routineExercises];
    updatedExercises.splice(index, 1);
    setRoutineExercises(updatedExercises);
    setShowExerciseOptionsSheet(false);
  };

  const handleExerciseOptions = (index: number) => {
    setCurrentExerciseIndex(index);
    setShowExerciseOptionsSheet(true);
  };

  const handleReorderClick = () => {
    setShowReorderSheet(true);
  };

  const handleReorderSave = () => {
    setShowReorderSheet(false);
  };

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    const updatedExercises = [...routineExercises];
    const [movedExercise] = updatedExercises.splice(fromIndex, 1);
    updatedExercises.splice(toIndex, 0, movedExercise);
    setRoutineExercises(updatedExercises);
  };

  const validateForm = () => {
    const errors = {
      name: !routineName,
      type: !routineType
    };
    
    setValidationErrors(errors);
    
    if (errors.name) {
      toast({
        title: "Error",
        description: "Escribe un nombre a la rutina",
        variant: "destructive"
      });
      return false;
    }
    
    if (errors.type) {
      toast({
        title: "Error",
        description: "Selecciona el tipo de rutina",
        variant: "destructive"
      });
      return false;
    }
    
    if (routineExercises.length === 0) {
      setShowNoExercisesDialog(true);
      return false;
    }
    
    setShowSaveConfirmDialog(true);
    return false;
  };

  const handleSaveRoutineStart = () => {
    validateForm();
  };

  const handleSaveRoutine = async () => {
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para guardar rutinas",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Insert routine
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: routineName,
          user_id: user.id,
          estimated_duration_minutes: routineExercises.length * 5, // Rough estimate
        })
        .select()
        .single();

      if (routineError) {
        throw new Error(routineError.message);
      }

      // Insert routine exercises
      const routineExercisesData = routineExercises.flatMap((exercise, exerciseIndex) => 
        exercise.sets.map((set, setIndex) => ({
          routine_id: routineData.id,
          exercise_id: parseInt(exercise.id),
          exercise_order: exerciseIndex + 1,
          set_number: setIndex + 1,
          reps_min: set.reps_min,
          reps_max: set.reps_max,
          rest_between_sets_seconds: set.rest_seconds
        }))
      );

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercisesData);

      if (exercisesError) {
        throw new Error(exercisesError.message);
      }

      toast({
        title: "¡Rutina creada!",
        description: `La rutina ${routineName} ha sido guardada correctamente`,
      });

      navigate("/workout");
    } catch (error) {
      console.error("Error saving routine:", error);
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar la rutina",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setShowSaveConfirmDialog(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Crear Rutina</h1>
        <Button 
          variant="primary" 
          size="sm"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSaveRoutineStart}
          disabled={isSubmitting}
        >
          Guardar
        </Button>
      </div>
      
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
                  className={`w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button ${validationErrors.name ? 'ring-1 ring-destructive' : ''}`}
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Rutina</label>
                <Select value={routineType} onValueChange={setRoutineType}>
                  <SelectTrigger className={`w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button ${validationErrors.type ? 'ring-1 ring-destructive' : ''}`}>
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
              
              <div className="flex justify-between items-center pt-2">
                <h3 className="text-base font-medium">Ejercicios</h3>
                {routineExercises.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReorderClick}
                  >
                    Ordenar
                  </Button>
                )}
              </div>
              
              {routineExercises.length > 0 ? (
                <div className="space-y-3">
                  {routineExercises.map((exercise, index) => (
                    <Card key={`${exercise.id}-${index}`} className="bg-secondary/40">
                      <CardBody>
                        <div className="flex items-center mb-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Grip className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <span className="text-xs text-muted-foreground">{exercise.muscle_group_main}</span>
                          </div>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="min-w-0 p-1"
                            onClick={() => handleExerciseOptions(index)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {exercise.sets.map((set, setIndex) => (
                          <div key={`set-${setIndex}`} className="mb-3 last:mb-0">
                            <div className="text-sm font-medium mb-1">Serie {setIndex + 1}</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs font-medium mb-1">Repeticiones</label>
                                <div className="flex items-center">
                                  <input 
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
                                    value={set.reps_min}
                                    onChange={(e) => handleSetUpdate(index, setIndex, "reps_min", parseInt(e.target.value))}
                                  />
                                  <span className="px-1">-</span>
                                  <input 
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
                                    value={set.reps_max}
                                    onChange={(e) => handleSetUpdate(index, setIndex, "reps_max", parseInt(e.target.value))}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Descanso (s)</label>
                                <input 
                                  type="number"
                                  min="0"
                                  max="300"
                                  step="5"
                                  className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
                                  value={set.rest_seconds}
                                  onChange={(e) => handleSetUpdate(index, setIndex, "rest_seconds", parseInt(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 w-full"
                          onClick={() => handleAddSet(index)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Agregar serie
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay ejercicios seleccionados
                </div>
              )}
              
              <div className="pt-2">
                <Button 
                  variant={routineExercises.length > 0 ? "secondary" : "primary"}
                  fullWidth 
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={handleSelectExercises}
                >
                  {routineExercises.length > 0 ? 'Añadir más ejercicios' : 'Añadir Ejercicios'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* No Exercises Confirmation Dialog */}
      <AlertDialog open={showNoExercisesDialog} onOpenChange={setShowNoExercisesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Continuar sin ejercicios?</AlertDialogTitle>
            <AlertDialogDescription>
              Todavía no has añadido ejercicios. ¿Quieres guardar de todos modos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowNoExercisesDialog(false);
              setShowSaveConfirmDialog(true);
            }}>Guardar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveConfirmDialog} onOpenChange={setShowSaveConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar guardado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea guardar esta rutina?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveRoutine}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exercise Options Sheet */}
      <Sheet open={showExerciseOptionsSheet} onOpenChange={setShowExerciseOptionsSheet}>
        <SheetContent side="bottom" className="px-0">
          <SheetHeader className="text-left px-4">
            <SheetTitle>Opciones de ejercicio</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 mt-4">
            <Button
              variant="secondary"
              fullWidth
              className="justify-start rounded-none px-4"
              onClick={() => {
                setShowExerciseOptionsSheet(false);
                setShowReorderSheet(true);
              }}
            >
              <Grip className="mr-2 h-5 w-5" /> Reordenar
            </Button>
            <Button
              variant="secondary"
              fullWidth
              className="justify-start rounded-none px-4"
              onClick={() => navigate("/workout/select-exercises")}
            >
              <Plus className="mr-2 h-5 w-5" /> Reemplazar ejercicio
            </Button>
            <Button
              variant="destructive"
              fullWidth
              className="justify-start rounded-none px-4"
              onClick={() => currentExerciseIndex !== null && handleRemoveExercise(currentExerciseIndex)}
            >
              <Trash2 className="mr-2 h-5 w-5" /> Eliminar ejercicio
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reorder Sheet */}
      <Sheet open={showReorderSheet} onOpenChange={setShowReorderSheet}>
        <SheetContent className="px-0 sm:max-w-md w-full">
          <SheetHeader className="text-left px-4">
            <SheetTitle>Reordenar ejercicios</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <div className="space-y-2">
              {routineExercises.map((exercise, index) => (
                <div key={`reorder-${exercise.id}-${index}`} className="flex items-center px-4 py-3 bg-secondary/40 rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2 p-1 min-w-0"
                    onClick={() => handleRemoveExercise(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{exercise.name}</h4>
                  </div>
                  <div className="flex items-center space-x-1">
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-1 min-w-0"
                        onClick={() => handleMoveExercise(index, index - 1)}
                      >
                        ↑
                      </Button>
                    )}
                    {index < routineExercises.length - 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-1 min-w-0"
                        onClick={() => handleMoveExercise(index, index + 1)}
                      >
                        ↓
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <SheetFooter className="px-4">
            <Button variant="primary" onClick={handleReorderSave}>Guardar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CreateRoutinePage;
