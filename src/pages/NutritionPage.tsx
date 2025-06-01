
import React, { useState } from "react";
import { Camera, Plus, Utensils } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import ProgressRing from "../components/ProgressRing";
import MacroProgress from "../components/MacroProgress";
import DaySelector from "../components/DaySelector";
import { CameraCapture } from "../components/nutrition/CameraCapture";
import { FoodPreviewCard } from "../components/nutrition/FoodPreviewCard";
import { useFoodLog, FoodLogEntry } from "../hooks/useFoodLog";
import { useFoodAnalysis } from "../hooks/useFoodAnalysis";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useFoodCapture } from "../hooks/useFoodCapture";
import { usePendingFoodEntries } from "../hooks/usePendingFoodEntries";

const NutritionPage: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const { entries, deleteEntry, isLoading } = useFoodLog(selectedDateString);
  const { analyzeFood, isAnalyzing } = useFoodAnalysis();
  const { uploadImageOnly, analyzeImageAsync, error: captureError } = useFoodCapture();
  const { 
    pendingEntries, 
    addPendingEntry, 
    updatePendingEntry, 
    removePendingEntry 
  } = usePendingFoodEntries();

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

  // Mock targets - in a real app these would come from user profile
  const macros = {
    calories: { current: todayTotals.calories, target: 2000, unit: "kcal" },
    protein: { current: todayTotals.protein, target: 120 },
    carbs: { current: todayTotals.carbs, target: 200 },
    fats: { current: todayTotals.fat, target: 65 }
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

  const handleImageCaptured = async (imageUrl: string, analysisResult?: any, imageBlob?: Blob) => {
    console.log('Image captured, navigating to nutrition immediately');
    
    // Close camera immediately
    setShowCamera(false);
    
    // Create pending entry
    const pendingId = addPendingEntry(imageUrl, `food-${Date.now()}.jpg`);
    
    // If we have analysis result already (shouldn't happen in new flow)
    if (analysisResult) {
      const pendingFoodData = {
        custom_food_name: analysisResult.name,
        quantity_consumed: analysisResult.servingSize,
        unit_consumed: analysisResult.servingUnit,
        calories_consumed: analysisResult.calories,
        protein_g_consumed: analysisResult.protein,
        carbs_g_consumed: analysisResult.carbs,
        fat_g_consumed: analysisResult.fat,
        healthScore: analysisResult.healthScore,
        ingredients: analysisResult.ingredients,
        photo_url: imageUrl
      };
      
      updatePendingEntry(pendingId, true);
      
      navigate('/food-edit', {
        state: {
          initialData: pendingFoodData,
          imageUrl: imageUrl,
          isEditing: false
        }
      });
      return;
    }
    
    // Start analysis in background if we have the blob
    if (imageBlob) {
      analyzeImageAsync(imageUrl, imageBlob, {
        onSuccess: (result) => {
          updatePendingEntry(pendingId, true);
          removePendingEntry(pendingId);
          
          // Navigate to edit when analysis completes
          const pendingFoodData = {
            custom_food_name: result.name,
            quantity_consumed: result.servingSize,
            unit_consumed: result.servingUnit,
            calories_consumed: result.calories,
            protein_g_consumed: result.protein,
            carbs_g_consumed: result.carbs,
            fat_g_consumed: result.fat,
            healthScore: result.healthScore,
            ingredients: result.ingredients,
            photo_url: imageUrl
          };
          
          navigate('/food-edit', {
            state: {
              initialData: pendingFoodData,
              imageUrl: imageUrl,
              isEditing: false
            }
          });
        },
        onError: (error) => {
          updatePendingEntry(pendingId, false, error);
        }
      });
    }
  };

  const handleRetryPendingEntry = async (pendingEntry: any) => {
    // Remove current pending entry and try manual entry
    removePendingEntry(pendingEntry.id);
    
    navigate('/food-edit', {
      state: {
        initialData: {
          custom_food_name: '',
          quantity_consumed: 1,
          unit_consumed: 'porción',
          calories_consumed: 0,
          protein_g_consumed: 0,
          carbs_g_consumed: 0,
          fat_g_consumed: 0,
          photo_url: pendingEntry.imageUrl
        },
        imageUrl: pendingEntry.imageUrl,
        isEditing: false,
        hasAnalysisError: true
      }
    });
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

  const handleDeletePendingEntry = (entryId: string) => {
    removePendingEntry(entryId);
  };

  // Combine pending entries with real entries for display
  const allEntries = [
    ...pendingEntries.map(pending => ({
      type: 'pending' as const,
      data: pending
    })),
    ...entries.map(entry => ({
      type: 'real' as const,
      data: entry
    }))
  ];

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Nutrición</h1>
      
      {/* Day selector */}
      <DaySelector 
        onSelectDate={setSelectedDate}
        datesWithRecords={getDatesWithEntries()}
        selectedDate={selectedDate}
      />
      
      {/* Error Alert - Only show if camera is not open */}
      {captureError && !showCamera && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {captureError}
          </AlertDescription>
        </Alert>
      )}
      
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
          ) : allEntries.length > 0 ? (
            allEntries.map((entry) => {
              if (entry.type === 'pending') {
                return (
                  <FoodPreviewCard
                    key={entry.data.id}
                    imageUrl={entry.data.imageUrl}
                    name=""
                    calories={0}
                    protein={0}
                    carbs={0}
                    fat={0}
                    loggedAt={entry.data.timestamp}
                    isLoading={entry.data.isLoading}
                    error={entry.data.error}
                    onRetry={() => handleRetryPendingEntry(entry.data)}
                    onDelete={isToday ? () => handleDeletePendingEntry(entry.data.id) : undefined}
                  />
                );
              } else {
                return (
                  <FoodPreviewCard
                    key={entry.data.id}
                    imageUrl={entry.data.photo_url || "/placeholder.svg"}
                    name={entry.data.custom_food_name}
                    calories={entry.data.calories_consumed}
                    protein={entry.data.protein_g_consumed}
                    carbs={entry.data.carbs_g_consumed}
                    fat={entry.data.fat_g_consumed}
                    loggedAt={entry.data.logged_at}
                    onClick={() => handleEditEntry(entry.data)}
                    onDelete={isToday ? () => handleDeleteEntry(entry.data.id!) : undefined}
                  />
                );
              }
            })
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
          analysisError={captureError}
        />
      )}

      {/* Loading overlay for analysis */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="neu-card p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
            <p className="text-sm font-medium">Analizando alimento...</p>
            <p className="text-xs text-muted-foreground mt-1">Esto puede tomar unos segundos</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPage;
