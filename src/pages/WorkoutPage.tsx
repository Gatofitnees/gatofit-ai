
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import WorkoutHeader from "@/components/workout/WorkoutHeader";
import WorkoutSearchFilter from "@/components/workout/WorkoutSearchFilter";
import WorkoutList from "@/components/workout/WorkoutList";
import { useRoutines } from "@/hooks/useRoutines";

const WorkoutPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { routines, loading } = useRoutines();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter routines based on search term
  const filteredRoutines = routines.filter(routine => 
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartWorkout = (routineId: number) => {
    // Navigate to routine details page
    navigate(`/workout/routine/${routineId}`);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <WorkoutHeader title="Mis Rutinas" />
      
      {/* Search and Filter */}
      <WorkoutSearchFilter 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* Routines List */}
      <WorkoutList 
        routines={filteredRoutines}
        loading={loading}
        onStartWorkout={handleStartWorkout}
      />
    </div>
  );
};

export default WorkoutPage;
