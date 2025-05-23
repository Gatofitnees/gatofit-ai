
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WorkoutPage from "./pages/WorkoutPage";
import NutritionPage from "./pages/NutritionPage";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";
import OnboardingFlow from "./pages/onboarding/OnboardingFlow";
import AuthProvider from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SelectExercisesPage from "./pages/SelectExercisesPage";
import ExerciseDetailsPage from "./pages/ExerciseDetailsPage";
import CreateExercisePage from "./pages/CreateExercisePage";
import CreateRoutinePage from "./pages/CreateRoutinePage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import WorkoutSummaryPage from "./pages/WorkoutSummaryPage";
import { RoutineProvider } from "./features/workout/contexts/RoutineContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-background text-foreground min-h-screen">
          <RoutineProvider>
            <Routes>
              <Route path="/onboarding/*" element={<OnboardingFlow />} />
              <Route
                path="/"
                element={
                  <Navigate to="/home" replace />
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                    <NavBar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout"
                element={
                  <ProtectedRoute>
                    <WorkoutPage />
                    <NavBar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/create"
                element={
                  <ProtectedRoute>
                    <CreateRoutinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/edit/:routineId"
                element={
                  <ProtectedRoute>
                    <CreateRoutinePage />
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
                path="/workout/summary/:workoutId"
                element={
                  <ProtectedRoute>
                    <WorkoutSummaryPage />
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
                path="/workout/exercise-details/:id"
                element={
                  <ProtectedRoute>
                    <ExerciseDetailsPage />
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
                path="/nutrition"
                element={
                  <ProtectedRoute>
                    <NutritionPage />
                    <NavBar />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RoutineProvider>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
