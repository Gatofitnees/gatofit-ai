
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WorkoutPage from "./pages/WorkoutPage";
import NutritionPage from "./pages/NutritionPage";
import RankingPage from "./pages/RankingPage";
import SocialPage from "./pages/SocialPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import BodyMeasurementsPage from "./pages/BodyMeasurementsPage";
import UserInformationPage from "./pages/UserInformationPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import AIChatPage from "./pages/AIChatPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import NavBar from "./components/NavBar";
import OnboardingFlow from "./pages/onboarding/OnboardingFlow";
import AuthProvider from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SelectExercisesPage from "./pages/SelectExercisesPage";
import ExerciseDetailsPage from "./pages/ExerciseDetailsPage";
import CreateExercisePage from "./pages/CreateExercisePage";
import CreateRoutinePage from "./pages/CreateRoutinePage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import WorkoutSummaryPage from "./pages/WorkoutSummaryPage";
import { FoodEditPage } from "./pages/FoodEditPage";
import { RoutineProvider } from "./features/workout/contexts/RoutineContext";
import { useEffect } from 'react';
import { optimizeForMobile } from '@/utils/mobileOptimizations';

function App() {
  useEffect(() => {
    // Initialize mobile optimizations
    optimizeForMobile();
  }, []);

  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <div className="bg-background text-foreground min-h-screen">
            <RoutineProvider>
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
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                      <NavBar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-chat"
                  element={
                    <ProtectedRoute>
                      <AIChatPage />
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
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <SubscriptionPage />
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
                  path="/profile/user-information"
                  element={
                    <ProtectedRoute>
                      <UserInformationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/public-profile/:userId"
                  element={
                    <ProtectedRoute>
                      <PublicProfilePage />
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
                <Route
                  path="/ranking"
                  element={
                    <ProtectedRoute>
                      <RankingPage />
                      <NavBar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/social"
                  element={
                    <ProtectedRoute>
                      <SocialPage />
                      <NavBar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/food-edit"
                  element={
                    <ProtectedRoute>
                      <FoodEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RoutineProvider>
          </div>
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
