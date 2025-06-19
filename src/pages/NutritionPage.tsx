
import React, { useState, useEffect } from "react";
import { Camera, Plus } from "lucide-react";
import Button from "../components/Button";
import DaySelector from "../components/DaySelector";
import { CameraCapture } from "../components/nutrition/CameraCapture";
import { useFoodLog } from "../hooks/useFoodLog";
import { useProfile } from "../hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { AnimatePresence } from "framer-motion";
import { useFoodProcessing } from "@/hooks/useFoodProcessing";
import { useDateManagement } from "@/hooks/useDateManagement";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import { CaloriesSummary } from "@/components/nutrition/CaloriesSummary";
import { MacrosSummary } from "@/components/nutrition/MacrosSummary";
import { MealsList } from "@/components/nutrition/MealsList";
import { UsageLimitsBanner } from "@/components/premium/UsageLimitsBanner";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { useFoodCaptureWithLimits } from "@/hooks/useFoodCaptureWithLimits";

const NutritionPage: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [usageInfo, setUsageInfo] = useState({ current: 0, limit: 10, canCapture: true, isOverLimit: false });
  const { isPremium } = useSubscription();
  
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

  const {
    capturePhotoWithLimitCheck,
    showPremiumModal,
    setShowPremiumModal,
    getNutritionUsageInfo
  } = useFoodCaptureWithLimits();

  // Load usage info on component mount and when it changes
  useEffect(() => {
    const loadUsageInfo = async () => {
      if (!isPremium) {
        const info = await getNutritionUsageInfo();
        setUsageInfo(info);
      }
    };
    loadUsageInfo();
  }, [isPremium, getNutritionUsageInfo]);

  const handlePhotoTakenAndCloseCamera = async (photoBlob: Blob) => {
    setShowCamera(false);
    
    // Check limits before processing
    const canCapture = await capturePhotoWithLimitCheck();
    if (canCapture) {
      await handlePhotoTaken(photoBlob);
      // Reload usage info after successful capture
      if (!isPremium) {
        const info = await getNutritionUsageInfo();
        setUsageInfo(info);
      }
    }
  };

  const handleOpenCamera = async () => {
    if (!isPremium) {
      const info = await getNutritionUsageInfo();
      setUsageInfo(info);
      
      if (!info.canCapture) {
        setShowPremiumModal(true);
        return;
      }
    }
    
    setShowCamera(true);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Nutrición</h1>
        {/* Usage banner para usuarios free */}
        {!isPremium && (
          <UsageLimitsBanner type="nutrition" />
        )}
      </div>
      
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
              onClick={handleOpenCamera}
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
            onClick={handleOpenCamera}
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

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="nutrition"
        currentUsage={usageInfo.current}
        limit={usageInfo.limit}
      />
    </div>
  );
};

export default NutritionPage;
