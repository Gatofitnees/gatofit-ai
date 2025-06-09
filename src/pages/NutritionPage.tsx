
import React, { useState } from "react";
import { Camera, Plus, Utensils } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import ProgressRing from "../components/ProgressRing";
import MacroProgress from "../components/MacroProgress";
import DaySelector from "../components/DaySelector";
import { CameraCapture } from "../components/nutrition/CameraCapture";
import { FoodAnalysisPreview } from "../components/nutrition/FoodAnalysisPreview";
import { FoodPreviewCard } from "../components/nutrition/FoodPreviewCard";
import { useFoodLog, FoodLogEntry } from "../hooks/useFoodLog";
import { useFoodCapture } from "../hooks/useFoodCapture";
import { useProfile } from "../hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const NutritionPage: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const { entries, addEntry, deleteEntry, isLoading } = useFoodLog(selectedDateString);
  const { 
    capturedImageUrl,
    analysisResult,
    isAnalyzing,
    analysisError,
    captureImageOnly,
    analyzeImage,
    clearAll
  } = useFoodCapture();
  const { profile } = useProfile();

  // Calculate today's totals from actual entries
  const todayTotals = entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories_consumed,
      protein: totals.protein + entry.protein_g_consumed,
      carbs: totals.carbs + entry.carbs_g_consumed,
      fat: totals.fat + entry.fat_g_consumed
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Use initial recommendations from profile as targets, with fallbacks
  const macros = {
    calories: { 
      current: todayTotals.calories, 
      target: profile?.initial_recommended_calories || 2000, 
      unit: "kcal" 
    },
    protein: { 
      current: todayTotals.protein, 
      target: profile?.initial_recommended_protein_g || 120 
    },
    carbs: { 
      current: todayTotals.carbs, 
      target: profile?.initial_recommended_carbs_g || 200 
    },
    fats: { 
      current: todayTotals.fat, 
      target: profile?.initial_recommended_fats_g || 65 
    }
  };
  
  const calorieProgress = Math.round((macros.calories.current / macros.calories.target) * 100);

  // Get dates with food entries for the day selector
  const getDatesWithEntries = (): Date[] => {
    return entries.length > 0 ? [selectedDate] : [];
  };

  const isToday = selectedDateString === new Date().toISOString().split('T')[0];
  const isSelectedDay = !isToday;

  const formatSelectedDate = () => {
    if (isToday) return "Hoy";
    
    const today = new Date();
    const selected = new Date(selectedDate);
    const diffTime = today.getTime() - selected.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return selected.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    });
  };

  const handleImageCaptured = async (imageUrl: string, imageBlob?: Blob) => {
    console.log('Image captured:', imageUrl);
    setShowCamera(false);
    setShowPreview(true);

    // If we have the blob, start analysis immediately
    if (imageBlob) {
      await analyzeImage(imageUrl, imageBlob);
    }
  };

  const handleRetryAnalysis = async () => {
    if (capturedImageUrl) {
      // For retry, we need to recapture since we don't store the blob
      setShowPreview(false);
      setShowCamera(true);
      clearAll();
    }
  };

  const handleSaveFood = async () => {
    if (!analysisResult || !capturedImageUrl) return;

    setIsSaving(true);
    try {
      const foodEntry = {
        custom_food_name: analysisResult.name,
        photo_url: capturedImageUrl,
        meal_type: 'snack1' as const,
        quantity_consumed: analysisResult.servingSize,
        unit_consumed: analysisResult.servingUnit,
        calories_consumed: analysisResult.calories,
        protein_g_consumed: analysisResult.protein,
        carbs_g_consumed: analysisResult.carbs,
        fat_g_consumed: analysisResult.fat,
        health_score: analysisResult.healthScore,
        ingredients: analysisResult.ingredients
      };

      const success = await addEntry(foodEntry);
      
      if (success) {
        toast.success('¡Comida guardada exitosamente!');
        setShowPreview(false);
        clearAll();
      } else {
        toast.error('Error al guardar la comida');
      }
    } catch (error) {
      console.error('Error saving food:', error);
      toast.error('Error al guardar la comida');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    clearAll();
  };

  const handleEditEntry = (entry: FoodLogEntry) => {
    navigate('/food-edit', {
      state: {
        initialData: entry,
        imageUrl: entry.photo_url || "",
        isEditing: true
      }
    });
  };

  const handleDeleteEntry = async (entryId: number) => {
    await deleteEntry(entryId);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Nutrición</h1>
      
      {/* Day selector */}
      <DaySelector 
        onSelectDate={setSelectedDate}
        datesWithRecords={getDatesWithEntries()}
        selectedDate={selectedDate}
      />
      
      {/* Calories Summary */}
      <div className="flex items-center justify-center mb-8 animate-fade-in">
        <div className="relative flex items-center justify-center">
          <ProgressRing progress={calorieProgress} size={130} strokeWidth={8} className="text-primary" />
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{macros.calories.current}</span>
            <span className="text-xs text-muted-foreground">/ {macros.calories.target}</span>
            <span className="text-xs mt-1">kcal</span>
          </div>
        </div>
      </div>
      
      {/* Macros Summary */}
      <Card className="mb-6">
        <CardHeader 
          title="Macronutrientes" 
          subtitle="Resumen diario" 
        />
        <CardBody>
          <div className="space-y-4">
            <MacroProgress 
              label="Proteínas" 
              current={macros.protein.current} 
              target={macros.protein.target}
              color="protein" 
            />
            <MacroProgress 
              label="Carbohidratos" 
              current={macros.carbs.current} 
              target={macros.carbs.target}
              color="carbs" 
            />
            <MacroProgress 
              label="Grasas" 
              current={macros.fats.current} 
              target={macros.fats.target}
              color="fat" 
            />
          </div>
        </CardBody>
      </Card>
      
      {/* Meals */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            Comidas - {formatSelectedDate()}
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
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground mt-2">Cargando comidas...</p>
            </div>
          ) : entries.length > 0 ? (
            entries.map((entry) => (
              <FoodPreviewCard
                key={entry.id}
                imageUrl={entry.photo_url || "/placeholder.svg"}
                name={entry.custom_food_name}
                calories={entry.calories_consumed}
                protein={entry.protein_g_consumed}
                carbs={entry.carbs_g_consumed}
                fat={entry.fat_g_consumed}
                loggedAt={entry.logged_at}
                onClick={() => handleEditEntry(entry)}
                onDelete={isToday ? () => handleDeleteEntry(entry.id!) : undefined}
              />
            ))
          ) : (
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isSelectedDay ? 'No hay comidas registradas en este día' : 'No has registrado comidas hoy'}
                  </p>
                  {isToday && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Usa el botón de cámara para empezar
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
      
      {/* Add Food Button - Only show for today */}
      {isToday && (
        <div className="fixed bottom-24 right-4 animate-fade-in">
          <Button 
            className="h-14 w-14 rounded-full shadow-neu-button"
            leftIcon={<Camera className="h-6 w-6" />}
            variant="primary"
            onClick={() => setShowCamera(true)}
          />
        </div>
      )}

      {/* Camera Capture - Only show for today */}
      {isToday && (
        <CameraCapture
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onImageCaptured={handleImageCaptured}
        />
      )}

      {/* Food Analysis Preview */}
      {showPreview && capturedImageUrl && (
        <FoodAnalysisPreview
          imageUrl={capturedImageUrl}
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          analysisError={analysisError}
          onClose={handleClosePreview}
          onRetry={handleRetryAnalysis}
          onSave={handleSaveFood}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default NutritionPage;
