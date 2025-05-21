
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RoutineProvider, useRoutine } from '@/contexts/RoutineContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Plus, X, Trash2, Move } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';

// Main content component
const RoutineForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const {
    routineName,
    routineType,
    exercises,
    isSubmitting,
    setRoutineName,
    setRoutineType,
    saveRoutine,
    deleteExercise,
    reorderExercises,
  } = useRoutine();
  
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showReorderSheet, setShowReorderSheet] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [draggedExercise, setDraggedExercise] = useState<number | null>(null);
  const [reorderList, setReorderList] = useState<typeof exercises>([]);
  
  // Initialize reorder list when sheet is opened
  const handleOpenReorderSheet = () => {
    setReorderList([...exercises]);
    setShowReorderSheet(true);
  };
  
  // Save the reordered list
  const handleSaveReorder = () => {
    reorderExercises(reorderList);
    setShowReorderSheet(false);
    toast({
      title: "Orden actualizado",
      description: "Los ejercicios han sido reordenados"
    });
  };
  
  // Drag and drop handlers for reordering
  const handleDragStart = (index: number) => {
    setDraggedExercise(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedExercise === null) return;
    if (draggedExercise === index) return;
    
    const newList = [...reorderList];
    const draggedItem = newList[draggedExercise];
    newList.splice(draggedExercise, 1);
    newList.splice(index, 0, draggedItem);
    
    setReorderList(newList);
    setDraggedExercise(index);
  };
  
  // Handle back button click
  const handleBackClick = () => {
    if (routineName || routineType || exercises.length > 0) {
      setShowDiscardDialog(true);
    } else {
      navigate('/workout');
    }
  };
  
  // Handle discard changes
  const handleDiscardChanges = () => {
    // Clear draft and navigate back
    localStorage.removeItem('workout_routine_draft');
    navigate('/workout');
  };
  
  // Handle navigation to select exercises
  const handleSelectExercises = () => {
    navigate('/workout/select-exercises');
  };
  
  // Handle save button click
  const handleSaveClick = () => {
    if (routineName && routineType && exercises.length > 0) {
      setShowSaveConfirmDialog(true);
    } else {
      // Validate and show errors
      if (!routineName) {
        toast({
          title: "Error",
          description: "Por favor ingresa un nombre para la rutina",
          variant: "destructive"
        });
        return;
      }
      
      if (!routineType) {
        toast({
          title: "Error",
          description: "Por favor selecciona un tipo de rutina",
          variant: "destructive"
        });
        return;
      }
      
      if (exercises.length === 0) {
        toast({
          title: "Error",
          description: "Por favor añade al menos un ejercicio a la rutina",
          variant: "destructive"
        });
        return;
      }
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header with back and save buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBackClick}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50 transition-colors"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Crear Rutina</h1>
        </div>
        <Button 
          variant="primary"
          size="sm"
          onClick={handleSaveClick}
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Save className="h-4 w-4 mr-1" />
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
      
      {/* Routine Form */}
      <div className="bg-white rounded-xl shadow-neu-button p-4 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nombre de la Rutina</label>
          <input 
            type="text" 
            placeholder="Ej: Día de Pierna" 
            className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Rutina</label>
          <Select value={routineType} onValueChange={setRoutineType}>
            <SelectTrigger className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
              <SelectItem value="strength">Fuerza</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="flexibility">Flexibilidad</SelectItem>
              <SelectItem value="mixed">Mixto</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Exercise List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Ejercicios</h2>
          {exercises.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleOpenReorderSheet}
            >
              <Move className="h-4 w-4 mr-1" />
              Reordenar
            </Button>
          )}
        </div>
        
        {exercises.length > 0 ? (
          <div className="space-y-2">
            {exercises.map((exercise, index) => (
              <div 
                key={`${exercise.id}-${index}`}
                className="bg-secondary/50 rounded-xl p-3 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <button 
                    onClick={() => deleteExercise(index)}
                    className="mr-3 p-1 rounded-full hover:bg-gray-200 text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{exercise.sets.length} series</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-xl">
            <p className="text-muted-foreground mb-2">No hay ejercicios añadidos</p>
          </div>
        )}
        
        <Button 
          onClick={handleSelectExercises}
          variant={exercises.length > 0 ? "outline" : "default"}
          className={`w-full mt-4 ${exercises.length === 0 ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
        >
          <Plus className="h-4 w-4 mr-1" />
          {exercises.length > 0 ? 'Añadir más ejercicios' : 'Añadir Ejercicios'}
        </Button>
      </div>
      
      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="rounded-xl border border-secondary bg-background/95 backdrop-blur-sm max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-center">¿Descartar cambios?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-center">
              ¿Te vas a ir sin guardar la rutina? Los cambios no guardados se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="w-full rounded-xl bg-destructive text-white hover:bg-destructive/90 py-3"
            >
              Descartar cambios
            </AlertDialogAction>
            <AlertDialogCancel 
              className="w-full rounded-xl bg-gray-800 text-white hover:bg-gray-700 py-3"
            >
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveConfirmDialog} onOpenChange={setShowSaveConfirmDialog}>
        <AlertDialogContent className="rounded-xl border border-secondary bg-background/95 backdrop-blur-sm max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-center">Confirmar guardado</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-center">
              ¿Está seguro que desea guardar esta rutina?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={() => {
                saveRoutine();
                setShowSaveConfirmDialog(false);
              }}
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 py-3"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar'}
            </AlertDialogAction>
            <AlertDialogCancel 
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gray-800 text-white hover:bg-gray-700 py-3"
            >
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reorder Sheet */}
      <Sheet open={showReorderSheet} onOpenChange={setShowReorderSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl h-[80vh]">
          <SheetHeader>
            <SheetTitle className="text-center">Reordenar Ejercicios</SheetTitle>
            <SheetDescription className="text-center">
              Arrastra y suelta los ejercicios para cambiar el orden
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {reorderList.map((exercise, index) => (
              <div 
                key={`reorder-${exercise.id}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                className="bg-secondary/50 rounded-xl p-3 flex items-center hover:bg-secondary/80 cursor-move"
              >
                <Move className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="font-medium">{exercise.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex space-x-2">
            <Button 
              variant="default" 
              className="w-full bg-blue-500 hover:bg-blue-600" 
              onClick={handleSaveReorder}
            >
              Guardar orden
            </Button>
            <SheetClose asChild>
              <Button variant="outline" className="w-full">Cancelar</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Wrapper component with provider
const CreateRoutinePage: React.FC = () => {
  return (
    <RoutineProvider>
      <RoutineForm />
    </RoutineProvider>
  );
};

export default CreateRoutinePage;
