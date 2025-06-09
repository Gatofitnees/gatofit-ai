
import React, { useState } from "react";
import { Camera, Plus, Utensils } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import ProgressRing from "../components/ProgressRing";
import MacroProgress from "../components/MacroProgress";
import DaySelector from "../components/DaySelector";
import { CameraCapture } from "../components/nutrition/CameraCapture";
import { FoodPreviewCard } from "../components/nutrition/FoodPreviewCard";
import { useFoodAnalysis } from "../hooks/useFoodAnalysis";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useFoodCapture } from "../hooks/useFoodCapture";
import { useOptimizedNutritionData } from "../hooks/useOptimizedNutritionData";
import { FoodLogEntry } from "../hooks/useFoodLog";
import { useOptimizedTimezone } from "../hooks/useOptimizedTimezone";

const NutritionPage: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const { getUserCurrentDate } = useOptimizedTimezone();
  const [selectedDate, setSelectedDate] = useState(getUserCurrentDate());
  const navigate = useNavigate();

  const { 
    entries, 
    isLoading, 
    datesWithFood, 
    macros, 
    deleteEntry 
  } = useOptimizedNutritionData(selectedDate);
  
  const { analyzeFood, isAnalyzing } = useFoodAnalysis();
  const { error: captureError } = useFoodCapture();
  
  const calorieProgress = Math.round((macros.calories.current / macros.calories.target) * 100);

  const isToday = selectedDate.toDateString() === getUserCurrentDate().toDateString();
  const isSelectedDay = !isToday;

  const formatSelectedDate = () => {
    if (isToday) return "Hoy";
    
    const today = getUserCurrentDate();
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

  const handleImageCaptured = async (imageUrl: string, analysisResult?: any) => {
    // If there's a capture error, don't navigate - stay in camera to show error dialog
    if (captureError) {
      return;
    }
    
    if (analysisResult) {
      // Use webhook analysis result with all data including ingredients
      const pendingFoodData = {
        custom_food_name: analysisResult.name,
        quantity_consumed: analysisResult.servingSize,
        unit_consumed: analysisResult.servingUnit,
        calories_consumed: analysisResult.calories,
        protein_g_consumed: analysisResult.protein,
        carbs_g_consumed: analysisResult.carbs,
        fat_g_consumed: analysisResult.fat,
        healthScore: analysisResult.healthScore,
        ingredients: analysisResult.ingredients, // Pass ingredients data
        photo_url: imageUrl
      };
      
      // Navigate to the full-screen edit page
      navigate('/food-edit', {
        state: {
          initialData: pendingFoodData,
          imageUrl: imageUrl,
          isEditing: false
        }
      });
    } else {
      // Fallback to old analysis method only if no capture error
      const analysis = await analyzeFood(imageUrl);
      
      if (analysis) {
        const pendingFoodData = {
          custom_food_name: analysis.name,
          quantity_consumed: analysis.servingSize,
          unit_consumed: analysis.servingUnit,
          calories_consumed: analysis.calories,
          protein_g_consumed: analysis.protein,
          carbs_g_consumed: analysis.carbs,
          fat_g_consumed: analysis.fat,
          photo_url: imageUrl
        };
        
        navigate('/food-edit', {
          state: {
            initialData: pendingFoodData,
            imageUrl: imageUrl,
            isEditing: false
          }
        });
      } else {
        // Navigate to manual entry when all analysis fails
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
              photo_url: imageUrl
            },
            imageUrl: imageUrl,
            isEditing: false,
            hasAnalysisError: true
          }
        });
      }
    }
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
      
      {/* Day selector with optimized food dates */}
      <DaySelector 
        onSelectDate={setSelectedDate}
        datesWithRecords={datesWithFood}
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
      
      {/* Add Food Button - Only show for today with improved centering */}
      {isToday && (
        <div className="fixed bottom-24 right-4 animate-fade-in">
          <Button 
            className="h-14 w-14 rounded-full shadow-neu-button flex items-center justify-center p-0"
            variant="primary"
            onClick={() => setShowCamera(true)}
          >
            <Camera className="h-6 w-6" />
          </Button>
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
