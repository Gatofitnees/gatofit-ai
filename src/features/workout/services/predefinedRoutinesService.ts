import { supabase } from "@/integrations/supabase/client";

// Initialize all predefined routines - this function now does nothing
// but we keep it to prevent breaking existing code that calls it
export const initPredefinedRoutines = async () => {
  try {
    console.log("Predefined routines have been removed from the application");
    return true;
  } catch (error) {
    console.error("Error in initPredefinedRoutines:", error);
    return true;
  }
};
