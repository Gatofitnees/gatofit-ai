
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";

// Pages
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import WorkoutPage from "./pages/WorkoutPage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import CreateRoutinePage from "./pages/CreateRoutinePage";
import RoutineDetailPage from "./pages/RoutineDetailPage";
import SelectExercisesPage from "./pages/SelectExercisesPage";
import CreateExercisePage from "./pages/CreateExercisePage";
import ExerciseDetailsPage from "./pages/ExerciseDetailsPage";
import WorkoutSummaryPage from "./pages/WorkoutSummaryPage";
import NutritionPage from "./pages/NutritionPage";
import FoodEditPage from "./pages/FoodEditPage";
import RankingPage from "./pages/RankingPage";
import ProfilePage from "./pages/ProfilePage";
import BodyMeasurementsPage from "./pages/BodyMeasurementsPage";
import SettingsPage from "./pages/SettingsPage";

// Onboarding
import OnboardingFlow from "./pages/onboarding/OnboardingFlow";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/onboarding/*" element={<OnboardingFlow />} />
              
              {/* Protected routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout"
                element={
                  <ProtectedRoute>
                    <WorkoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/active/:routineId"
                element={
                  <ProtectedRoute>
                    <ActiveWorkoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/create-routine"
                element={
                  <ProtectedRoute>
                    <CreateRoutinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/routine/:id"
                element={
                  <ProtectedRoute>
                    <RoutineDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/select-exercises"
                element={
                  <ProtectedRoute>
                    <SelectExercisesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/create-exercise"
                element={
                  <ProtectedRoute>
                    <CreateExercisePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/exercise/:id"
                element={
                  <ProtectedRoute>
                    <ExerciseDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/summary/:workoutId"
                element={
                  <ProtectedRoute>
                    <WorkoutSummaryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nutrition"
                element={
                  <ProtectedRoute>
                    <NutritionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nutrition/food/:foodId/edit"
                element={
                  <ProtectedRoute>
                    <FoodEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ranking"
                element={
                  <ProtectedRoute>
                    <RankingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/body-measurements"
                element={
                  <ProtectedRoute>
                    <BodyMeasurementsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
