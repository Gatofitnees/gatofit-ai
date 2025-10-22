import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WorkoutPage from "./pages/WorkoutPage";
import NutritionPage from "./pages/NutritionPage";
import RankingPage from "./pages/RankingPage";
import SocialPage from "./pages/SocialPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import BodyMeasurementsPage from "./pages/BodyMeasurementsPage";
import UserInformationPage from "./pages/UserInformationPage";
import ProgressPage from "./pages/ProgressPage";
import CalendarPage from "./pages/CalendarPage";
import FoodSearchPage from "./pages/FoodSearchPage";
import SettingsPage from "./pages/SettingsPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import AIChatPage from "./pages/AIChatPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import WeeklyProgramsPage from "./pages/WeeklyProgramsPage";
import CreateWeeklyProgramPage from "./pages/CreateWeeklyProgramPage";
import ViewWeeklyProgramPage from "./pages/ViewWeeklyProgramPage";
import EditWeeklyProgramPage from "./pages/EditWeeklyProgramPage";
import GatofitProgramsPage from "./pages/GatofitProgramsPage";
import GatofitProgramDetailPage from "./pages/GatofitProgramDetailPage";
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
import { ProgressiveNutritionProgramPage } from "./pages/ProgressiveNutritionProgramPage";
import RoutineDetailPage from "./pages/RoutineDetailPage";
import { RoutineProvider } from "./features/workout/contexts/RoutineContext";
import { WorkoutCacheProvider, useWorkoutCacheContext } from "./features/workout/contexts/WorkoutCacheContext";
import { WorkoutRecoveryDialog } from "./features/workout/components/active-workout/WorkoutRecoveryDialog";
import { PaymentFailureAlert } from "./components/subscription/PaymentFailureAlert";
import { supabase } from "@/integrations/supabase/client";
import { optimizeForMobile } from '@/utils/mobileOptimizations';

// Component to handle workout recovery on app start
const WorkoutRecoveryHandler: React.FC = () => {
  const navigate = useNavigate();
  const { cachedWorkout, clearCache, checkCache } = useWorkoutCacheContext();
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  useEffect(() => {
    // Check for cached workout on mount only once
    const cache = checkCache();
    if (cache) {
      setShowRecoveryDialog(true);
    }
  }, []); // Empty deps - only run once on mount

  const handleContinue = () => {
    if (cachedWorkout) {
      setShowRecoveryDialog(false);
      navigate(`/workout/active/${cachedWorkout.routineId}`, {
        state: { fromCache: true }
      });
    }
  };

  const handleDiscard = () => {
    clearCache();
    setShowRecoveryDialog(false);
  };

  return (
    <WorkoutRecoveryDialog
      open={showRecoveryDialog}
      cacheData={cachedWorkout}
      onContinue={handleContinue}
      onDiscard={handleDiscard}
    />
  );
};

// Global payment failure banner component
const GlobalPaymentFailureBanner: React.FC = () => {
  const [paymentFailure, setPaymentFailure] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subData && (subData.status as string) === 'payment_failed') {
        setSubscription(subData);

        // Get payment failure info
        const { data: failureData } = await supabase
          .from('subscription_payment_failures')
          .select('*')
          .eq('user_id', user.id)
          .is('resolved_at', null)
          .order('failed_at', { ascending: false })
          .limit(1)
          .single();

        if (failureData) {
          setPaymentFailure(failureData);
        }
      } else {
        setPaymentFailure(null);
        setSubscription(null);
      }
    };

    checkPaymentStatus();
  }, []);

  if (!paymentFailure || !subscription) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <PaymentFailureAlert
        gracePeriodEndsAt={paymentFailure.grace_period_ends_at}
        compact={true}
      />
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialize mobile optimizations
    optimizeForMobile();
  }, []);

  return (
    <AuthProvider>
      <ProfileProvider>
        <WorkoutCacheProvider>
          <Router>
            <WorkoutRecoveryHandler />
            <GlobalPaymentFailureBanner />
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
                  path="/profile/progress"
                  element={
                    <ProtectedRoute>
                      <ProgressPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/calendar"
                  element={
                    <ProtectedRoute>
                      <CalendarPage />
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
                  path="/workout/programs"
                  element={
                    <ProtectedRoute>
                      <WeeklyProgramsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workout/programs/create"
                  element={
                    <ProtectedRoute>
                      <CreateWeeklyProgramPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workout/programs/view/:programId"
                  element={
                    <ProtectedRoute>
                      <ViewWeeklyProgramPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workout/programs/edit/:programId"
                  element={
                    <ProtectedRoute>
                      <EditWeeklyProgramPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gatofit-programs"
                  element={
                    <ProtectedRoute>
                      <GatofitProgramsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gatofit-programs/:programId"
                  element={
                    <ProtectedRoute>
                      <GatofitProgramDetailPage />
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
                  path="/routine/:routineId"
                  element={
                    <ProtectedRoute>
                      <RoutineDetailPage />
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
                  path="/nutrition/search"
                  element={
                    <ProtectedRoute>
                      <FoodSearchPage />
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
                <Route
                  path="/nutrition-program"
                  element={
                    <ProtectedRoute>
                      <ProgressiveNutritionProgramPage />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RoutineProvider>
          </div>
        </Router>
      </WorkoutCacheProvider>
    </ProfileProvider>
  </AuthProvider>
);
}

export default App;
