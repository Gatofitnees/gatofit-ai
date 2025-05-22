
import { supabase } from "@/integrations/supabase/client";
import { preloadedExercises } from "@/data/preloadedExercises";
import { additionalExercises } from "@/data/additionalExercises";
import { Exercise, DifficultyLevel } from "../types";

// This function ensures that preloaded exercises exist in the database
export async function syncExercisesToDatabase() {
  try {
    console.log("Starting exercise synchronization...");
    
    // Combine all exercises
    const allExercises = [...preloadedExercises, ...additionalExercises];
    
    // Get all existing exercises
    const { data: existingExercises, error: fetchError } = await supabase
      .from('exercises')
      .select('id, name');
      
    if (fetchError) {
      console.error("Error fetching existing exercises:", fetchError);
      throw fetchError;
    }
    
    // Create a map of existing exercise IDs for quick lookup
    const existingIds = new Map(
      (existingExercises || []).map(ex => [ex.id, ex.name])
    );
    
    console.log(`Found ${existingIds.size} existing exercises in database`);
    
    // Filter exercises that don't exist in the database
    const exercisesToInsert = allExercises.filter(ex => !existingIds.has(ex.id));
    
    if (exercisesToInsert.length === 0) {
      console.log("All exercises are already in the database. No need to sync.");
      return;
    }
    
    console.log(`Preparing to insert ${exercisesToInsert.length} exercises`);
    
    // Map exercises to ensure difficulty_level is of the correct type
    const formattedExercises = exercisesToInsert.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      muscle_group_main: exercise.muscle_group_main,
      equipment_required: exercise.equipment_required,
      difficulty_level: normalizeDifficultyLevel(exercise.difficulty_level),
      video_url: exercise.video_url,
      description: exercise.description,
      // Set created_by_user_id to null for preloaded/system exercises
      created_by_user_id: null
    }));
    
    // Insert missing exercises in batches to avoid timeouts
    const batchSize = 20;
    for (let i = 0; i < formattedExercises.length; i += batchSize) {
      const batch = formattedExercises.slice(i, i + batchSize);
      
      // Insert a batch of exercises - ensuring the types match
      const { error: insertError } = await supabase
        .from('exercises')
        .insert(batch);
        
      if (insertError) {
        console.error(`Error inserting batch ${i/batchSize + 1}:`, insertError);
        console.error("Error details:", insertError.details, insertError.message);
        throw insertError;
      }
      
      console.log(`Successfully inserted batch ${i/batchSize + 1} of exercises`);
    }
    
    console.log(`Successfully synchronized ${exercisesToInsert.length} exercises to database`);
  } catch (error) {
    console.error("Error synchronizing exercises:", error);
    throw error;
  }
}

// Helper function to normalize difficulty level values
function normalizeDifficultyLevel(level?: string): DifficultyLevel | undefined {
  if (!level) return undefined;
  
  // Convert Spanish difficulty levels to English
  const lowerLevel = level.toLowerCase();
  
  if (lowerLevel === "principiante") return "beginner";
  if (lowerLevel === "intermedio") return "intermediate";
  if (lowerLevel === "avanzado") return "advanced";
  
  // If the level is already one of the accepted values, return it
  if (["beginner", "intermediate", "advanced"].includes(lowerLevel)) {
    return lowerLevel as DifficultyLevel;
  }
  
  // Default to beginner if no match
  console.warn(`Unrecognized difficulty level: "${level}", defaulting to "beginner"`);
  return "beginner";
}
