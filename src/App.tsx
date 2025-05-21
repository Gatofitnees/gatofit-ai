
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import RoutineDetailPage from "./pages/RoutineDetailPage";
import { RoutineProvider } from "./features/workout/contexts/RoutineContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-background text-foreground min-h-screen">
          <Routes>
            <Route path="/onboarding/*" element={<OnboardingFlow />} />
            <Route
              path="/"
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
                  <NavBar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/routine/:routineId"
              element={
                <ProtectedRoute>
                  <RoutineDetailPage />
                  <NavBar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/select-exercises"
              element={
                <ProtectedRoute>
                  <RoutineProvider>
                    <SelectExercisesPage />
                  </RoutineProvider>
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
