
import { supabase } from "@/integrations/supabase/client";
import { preloadedExercises } from "@/data/preloadedExercises";
import { additionalExercises } from "@/data/additionalExercises";

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
    
    // Insert missing exercises in batches to avoid timeouts
    const batchSize = 20;
    for (let i = 0; i < exercisesToInsert.length; i += batchSize) {
      const batch = exercisesToInsert.slice(i, i + batchSize);
      
      // Insert a batch of exercises
      const { error: insertError } = await supabase
        .from('exercises')
        .insert(batch);
        
      if (insertError) {
        console.error(`Error inserting batch ${i/batchSize + 1}:`, insertError);
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
