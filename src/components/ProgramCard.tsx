import React from "react";
import { Card, CardBody } from "@/components/Card";
import ProgramDayNavigator from "./ProgramDayNavigator";
import { useActiveProgramUnified } from "@/hooks/useActiveProgramUnified";

interface ProgramCardProps {
  selectedDate: Date;
  onStartWorkout: (routineId: number) => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  selectedDate,
  onStartWorkout
}) => {
  const { activeProgram, loading } = useActiveProgramUnified(selectedDate);

  // Don't render if no active program or still loading
  if (loading || !activeProgram) {
    return null;
  }

  return (
    <Card className="min-h-[200px]">
      <CardBody>
        <ProgramDayNavigator 
          selectedDate={selectedDate}
          onStartWorkout={onStartWorkout}
        />
      </CardBody>
    </Card>
  );
};

export default ProgramCard;