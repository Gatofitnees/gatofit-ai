
import { ExerciseSession, ExerciseStats } from "../types/exerciseHistory";

interface RawExerciseData {
  id: number;
  exercise_id: number;
  weight_kg_used: number | null;
  reps_completed: number | null;
  set_number: number;
  workout_log_id: number;
  workout_log: {
    workout_date: string;
    user_id: string;
  } | {
    workout_date: string;
    user_id: string;
  }[];
}

export const processExerciseData = (data: RawExerciseData[]): ExerciseStats => {
  if (!data || data.length === 0) {
    return {
      maxWeight: null,
      maxReps: null,
      sessions: [],
      progressData: []
    };
  }

  let globalMaxWeight = 0;
  let globalMaxReps = 0;
  
  // Group by unique date - each date should have ONE session only
  const sessionsByDate = new Map<string, ExerciseSession>();
  
  data.forEach((entry) => {
    const workoutLog = Array.isArray(entry.workout_log) 
      ? entry.workout_log[0] 
      : entry.workout_log;
    
    if (!workoutLog?.workout_date) return;
    
    const displayDate = new Date(workoutLog.workout_date).toLocaleDateString('es-ES');
    const weight = entry.weight_kg_used || 0;
    const reps = entry.reps_completed || 0;
    
    // Calculate global statistics
    if (weight > globalMaxWeight) globalMaxWeight = weight;
    if (reps > globalMaxReps) globalMaxReps = reps;
    
    // If session exists for this date, add the set
    if (sessionsByDate.has(displayDate)) {
      const existingSession = sessionsByDate.get(displayDate)!;
      
      // Add set to existing session
      existingSession.sets.push({
        set_number: entry.set_number,
        weight_kg_used: entry.weight_kg_used,
        reps_completed: entry.reps_completed
      });
      
      // Update session statistics
      if (weight > (existingSession.maxWeight || 0)) {
        existingSession.maxWeight = weight;
      }
      existingSession.totalReps += reps;
      
    } else {
      // Create new session for this date
      sessionsByDate.set(displayDate, {
        date: displayDate,
        sets: [{
          set_number: entry.set_number,
          weight_kg_used: entry.weight_kg_used,
          reps_completed: entry.reps_completed
        }],
        maxWeight: weight || null,
        totalReps: reps
      });
    }
  });
  
  // Convert Map to array and sort sets within each session
  const sessions = Array.from(sessionsByDate.values()).map(session => ({
    ...session,
    sets: session.sets.sort((a, b) => a.set_number - b.set_number)
  }));
  
  // Sort sessions by date (most recent first)
  const sortedSessions = sessions.sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  });
  
  // Create progress data for chart (chronological order)
  const progressData = sortedSessions
    .filter(session => session.maxWeight && session.maxWeight > 0)
    .reverse() // Chronological order for the chart
    .map(session => ({
      date: session.date,
      maxWeight: session.maxWeight!
    }));
  
  return {
    maxWeight: globalMaxWeight || null,
    maxReps: globalMaxReps || null,
    sessions: sortedSessions,
    progressData
  };
};
