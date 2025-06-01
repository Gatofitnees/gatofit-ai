
import React, { useState, useEffect } from "react";
import { Camera, Upload, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserHeader from "@/components/UserHeader";
import DaySelector from "@/components/DaySelector";
import MacrosCard from "@/components/MacrosCard";
import { FoodScanDialog } from "@/components/nutrition/FoodScanDialog";
import FloatingActionButton from "@/components/FloatingActionButton";
import { useFoodLog } from "@/hooks/useFoodLog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const NutritionPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFoodScan, setShowFoodScan] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [datesWithFood, setDatesWithFood] = useState<Date[]>([]);
  
  // Convert selectedDate to string format for the hook
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");
  const { entries: foodEntries, isLoading: loading, refetch } = useFoodLog(selectedDateString);

  // Calculate macros from food entries
  const macros = React.useMemo(() => {
    const totals = foodEntries.reduce((acc, entry) => ({
      calories: acc.calories + entry.calories_consumed,
      protein: acc.protein + entry.protein_g_consumed,
      carbs: acc.carbs + entry.carbs_g_consumed,
      fat: acc.fat + entry.fat_g_consumed
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      calories: { consumed: totals.calories, target: 2000 },
      protein: { consumed: totals.protein, target: 150 },
      carbs: { consumed: totals.carbs, target: 250 },
      fat: { consumed: totals.fat, target: 65 }
    };
  }, [foodEntries]);

  // Fetch dates with food entries for the blue dots
  useEffect(() => {
    const fetchFoodDates = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('daily_food_log_entries')
          .select('log_date')
          .eq('user_id', user.id)
          .order('log_date', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const dates = data.map(item => new Date(item.log_date + 'T00:00:00'));
          setDatesWithFood(dates);
        }
      } catch (error) {
        console.error("Error al cargar fechas con alimentos:", error);
      }
    };
    
    fetchFoodDates();
  }, [user, foodEntries]); // Refresh when food entries change

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleFoodScanned = () => {
    setShowFoodScan(false);
    refetch();
    toast({
      title: "Alimento añadido",
      description: "Se ha registrado tu alimento correctamente",
    });
  };

  const handleAddFood = () => {
    setShowFoodScan(true);
  };

  const handleManualAdd = () => {
    toast({
      title: "Añadir manualmente",
      description: "Función próximamente disponible",
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast({
        title: "Buscar alimento",
        description: `Buscando: ${searchQuery}`,
      });
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* User header */}
      <UserHeader />
      
      {/* Day selector with blue dots for days with food */}
      <DaySelector 
        onSelectDate={handleDateSelect}
        datesWithRecords={datesWithFood}
        selectedDate={selectedDate}
      />

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar alimentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Button
          variant="outline"
          onClick={handleAddFood}
          className="flex flex-col items-center gap-2 h-20"
        >
          <Camera className="h-6 w-6" />
          <span className="text-xs">Escanear</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleManualAdd}
          className="flex flex-col items-center gap-2 h-20"
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs">Manual</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleManualAdd}
          className="flex flex-col items-center gap-2 h-20"
        >
          <Upload className="h-6 w-6" />
          <span className="text-xs">Receta</span>
        </Button>
      </div>

      {/* Macros card */}
      <MacrosCard 
        macros={macros}
        onAddFood={handleAddFood}
      />

      {/* Food entries for selected date */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Alimentos del {format(selectedDate, "dd/MM/yyyy")}
        </h3>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-pulse text-muted-foreground">Cargando...</div>
          </div>
        ) : foodEntries.length > 0 ? (
          <div className="space-y-3">
            {foodEntries.map((entry, index) => (
              <div key={index} className="p-3 bg-card rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{entry.custom_food_name || 'Alimento'}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.meal_type} • {entry.quantity_consumed} {entry.unit_consumed}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(entry.calories_consumed)} kcal</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay alimentos registrados para este día</p>
            <Button onClick={handleAddFood} className="mt-4">
              Añadir primer alimento
            </Button>
          </div>
        )}
      </div>

      {/* Food scan dialog */}
      <FoodScanDialog
        isOpen={showFoodScan}
        onClose={() => setShowFoodScan(false)}
        onImageCaptured={handleFoodScanned}
      />
      
      {/* Floating action button */}
      <FloatingActionButton onClick={handleAddFood} />
    </div>
  );
};

export default NutritionPage;
