
import React from "react";
import { Clock, ChevronRight, Play } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";

interface WorkoutListItemProps {
  id: number;
  name: string;
  type?: string;
  exerciseCount?: number;
  duration?: number;
  onStartWorkout: (id: number) => void;
}

const WorkoutListItem: React.FC<WorkoutListItemProps> = ({
  id,
  name,
  type,
  exerciseCount,
  duration,
  onStartWorkout,
}) => {
  const navigate = useNavigate();
  
  const handleItemClick = () => {
    navigate(`/workout/routine/${id}`);
  };

  return (
    <Card className="bg-secondary/40 hover:bg-secondary/60 transition-colors cursor-pointer">
      <CardBody>
        <div className="flex items-center">
          <div className="flex-1" onClick={handleItemClick}>
            <h3 className="font-medium">{name}</h3>
            <div className="flex items-center mt-1">
              {type && (
                <span className="text-xs text-muted-foreground mr-2">
                  {type}
                </span>
              )}
              {duration && (
                <span className="text-xs flex items-center mr-2">
                  <Clock className="h-3 w-3 mr-1 text-primary" />
                  {duration} min
                </span>
              )}
              {exerciseCount && (
                <span className="text-xs text-muted-foreground">
                  {exerciseCount} ejercicios
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="p-1 min-w-0 mr-2"
              onClick={() => onStartWorkout(id)}
              leftIcon={<Play className="h-3 w-3 text-primary" />}
            />
            <ChevronRight className="h-5 w-5 text-muted-foreground" onClick={handleItemClick} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default WorkoutListItem;
