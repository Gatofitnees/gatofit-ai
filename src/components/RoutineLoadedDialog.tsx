
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RoutineLoadedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineName: string;
}

const RoutineLoadedDialog: React.FC<RoutineLoadedDialogProps> = ({
  open,
  onOpenChange,
  routineName
}) => {
  const navigate = useNavigate();

  const handleViewWorkout = () => {
    onOpenChange(false);
    navigate('/workout');
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¡Rutina cargada!</AlertDialogTitle>
          <AlertDialogDescription>
            "{routineName}" se ha agregado a tus rutinas con éxito.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleViewWorkout}>
            Ver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RoutineLoadedDialog;
