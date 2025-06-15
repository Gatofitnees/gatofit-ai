
import React, { useState } from "react";
import { Camera, Plus } from "lucide-react";
import Button from "../components/Button";
import DaySelector from "../components/DaySelector";
import { CameraCapture } from "../components/nutrition/CameraCapture";
import { useFoodLog } from "../hooks/useFoodLog";
import { useProfile } from "../hooks/useProfile";
import { AnimatePresence } from "framer-motion";
import { useFoodProcessing } from "@/hooks/useFoodProcessing";
import { useDateManagement } from "@/hooks/useDateManagement";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import { CaloriesSummary } from "@/components/nutrition/CaloriesSummary";
import { MacrosSummary } from "@/components/nutrition/MacrosSummary";
import { MealsList } from "@/components/nutrition/MealsList";

const NutritionPage: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { profile } = useProfile();
  const { entries, deleteEntry, isLoading, addEntry } = useFoodLog(selectedDate.toISOString().split('T')[0]);
  
  const { 
    isToday, 
    isSelectedDay, 
    formatSelectedDate,
    getDatesWithEntries
  } = useDateManagement(selectedDate, entries);
  
  const { macros, calorieProgress } = useNutritionCalculations(entries, profile);
  
  const { 
    processingFoods,
    handlePhotoTaken,
    handleRetryAnalysis,
    handleCancelProcessing
  } = useFoodProcessing(addEntry);

  const handlePhotoTakenAndCloseCamera = async (photoBlob: Blob) => {
    setShowCamera(false);
    await handlePhotoTaken(photoBlob);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Nutrición</h1>
      
      <DaySelector 
        onSelectDate={setSelectedDate}
        datesWithRecords={getDatesWithEntries()}
        selectedDate={selectedDate}
      />
      
      <CaloriesSummary macros={macros} calorieProgress={calorieProgress} />
      
      <MacrosSummary macros={macros} />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            Comidas - {formatSelectedDate}
          </h2>
          {isToday && (
            <Button 
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCamera(true)}
            >
              Añadir
            </Button>
          )}
        </div>
        
        <MealsList
          entries={entries}
          isLoading={isLoading}
          processingFoods={processingFoods}
          isToday={isToday}
          isSelectedDay={isSelectedDay}
          deleteEntry={deleteEntry}
          handleRetryAnalysis={handleRetryAnalysis}
          handleCancelProcessing={handleCancelProcessing}
        />
      </div>
      
      {isToday && (
        <div className="fixed bottom-24 right-4 animate-fade-in">
          <Button 
            className="h-14 w-14 rounded-full shadow-neu-button"
            variant="primary"
            onClick={() => setShowCamera(true)}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isToday && showCamera && (
          <CameraCapture
            isOpen={showCamera}
            onClose={() => setShowCamera(false)}
            onPhotoTaken={handlePhotoTakenAndCloseCamera}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutritionPage;
