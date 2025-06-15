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
import { useFoodCapture } from "../hooks/useFoodCapture";
import { useProfile } from "../hooks/useProfile";
import { useToast } from "@/components/ui/use-toast";
import { ProcessingFoodCard } from "@/components/nutrition/ProcessingFoodCard";
import { AnimatePresence } from "framer-motion";

const NutritionPage: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [processingFoods, setProcessingFoods] = useState<{ id: string; imageSrc: string; blob: Blob; error?: string | null }[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const { entries, deleteEntry, isLoading, addEntry } = useFoodLog(selectedDateString);
  const { isAnalyzing } = useFoodAnalysis();
  const { uploadImageWithAnalysis, clearError, error: foodCaptureError } = useFoodCapture();
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
    // For now, we'll just return the selected date if it has entries
    // In a real implementation, you might want to fetch this from the database
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

  const runAnalysis = async (blob: Blob, id: string, imageSrc: string) => {
    clearError();
    try {
      const result = await uploadImageWithAnalysis(blob);

      if (result && result.analysisResult) {
        const analysis = result.analysisResult;
        const newEntryData: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'> = {
          custom_food_name: analysis.name || 'Alimento Analizado',
          quantity_consumed: analysis.servingSize || 1,
          unit_consumed: analysis.servingUnit || 'porción',
          calories_consumed: analysis.calories || 0,
          protein_g_consumed: analysis.protein || 0,
          carbs_g_consumed: analysis.carbs || 0,
          fat_g_consumed: analysis.fat || 0,
          health_score: analysis.healthScore,
          ingredients: analysis.ingredients,
          photo_url: result.imageUrl,
          meal_type: 'snack1', // Default meal type, can be changed on edit
        };
        await addEntry(newEntryData);
        setProcessingFoods(prev => prev.filter(p => p.id !== id));
        URL.revokeObjectURL(imageSrc);
      } else {
        const errorMessage = foodCaptureError || "No se pudo analizar la comida. Revisa tu conexión o la imagen.";
        toast({
          title: "Error de Análisis",
          description: errorMessage,
          variant: "destructive",
        });
        setProcessingFoods(prev => prev.map(p => p.id === id ? { ...p, error: errorMessage } : p));
      }
    } catch (error) {
      console.error("Error processing food:", error);
      const errorMessage = foodCaptureError || "Ocurrió un error al procesar la imagen.";
      toast({
        title: "Error Inesperado",
        description: errorMessage,
        variant: "destructive",
      });
      setProcessingFoods(prev => prev.map(p => p.id === id ? { ...p, error: errorMessage } : p));
    }
  };

  const handlePhotoTaken = async (photoBlob: Blob) => {
    setShowCamera(false);
    const tempId = Date.now().toString();
    const imageSrc = URL.createObjectURL(photoBlob);

    setProcessingFoods(prev => [{ id: tempId, imageSrc, blob: photoBlob, error: null }, ...prev]);
    await runAnalysis(photoBlob, tempId, imageSrc);
  };

  const handleRetryAnalysis = async (foodId: string) => {
    const foodToRetry = processingFoods.find(f => f.id === foodId);
    if (!foodToRetry) return;

    setProcessingFoods(prev => prev.map(p => p.id === foodId ? { ...p, error: null } : p));
    await runAnalysis(foodToRetry.blob, foodToRetry.id, foodToRetry.imageSrc);
  };

  const handleCancelProcessing = (foodId: string) => {
    const foodToRemove = processingFoods.find(f => f.id === foodId);
    if (foodToRemove) {
      URL.revokeObjectURL(foodToRemove.imageSrc);
      setProcessingFoods(prev => prev.filter(p => p.id !== foodId));
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
          {processingFoods.map((food) => (
            <ProcessingFoodCard 
              key={food.id} 
              imageUrl={food.imageSrc} 
              error={food.error}
              onRetry={() => handleRetryAnalysis(food.id)}
              onCancel={() => handleCancelProcessing(food.id)}
            />
          ))}
          {isLoading && processingFoods.length === 0 ? (
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
            processingFoods.length === 0 && (
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
            )
          )}
        </div>
      </div>
      
      {/* Add Food Button - Only show for today */}
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

      {/* Camera Capture - Only show for today */}
      <AnimatePresence>
        {isToday && showCamera && (
          <CameraCapture
            isOpen={showCamera}
            onClose={() => setShowCamera(false)}
            onPhotoTaken={handlePhotoTaken}
          />
        )}
      </AnimatePresence>

      {/* Loading overlay for analysis (can be removed if not desired) */}
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
