import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";

// Onboarding Steps
import Welcome from "./steps/Welcome";
import Gender from "./steps/Gender";
import TrainingFrequency from "./steps/TrainingFrequency";
import PreviousExperience from "./steps/PreviousExperience";
import ProgressComparison from "./steps/ProgressComparison";
import PhysicalData from "./steps/PhysicalData";
import BirthDate from "./steps/BirthDate";
import MainGoal from "./steps/MainGoal";
import TargetWeight from "./steps/TargetWeight";
import GoalRealism from "./steps/GoalRealism";
import DesiredPace from "./steps/DesiredPace";
import CommonObstacles from "./steps/CommonObstacles";
import Diet from "./steps/Diet";
import DesiredAchievements from "./steps/DesiredAchievements";
import Gratitude from "./steps/Gratitude";
import InitialRecommendation from "./steps/InitialRecommendation";
import FeaturesPreview from "./steps/FeaturesPreview";
import CreateAccount from "./steps/CreateAccount";
import Login from "./steps/Login";
import AppTransition from "./steps/AppTransition";

// OnboardingContext to share data between steps
export interface OnboardingData {
  gender: string | null;
  trainingsPerWeek: number;
  previousAppExperience: boolean | null;
  height: number | null;
  heightUnit: "cm" | "ft-in";
  weight: number | null;
  weightUnit: "kg" | "lbs";
  bodyFatPercentage: number | null;
  dateOfBirth: Date | null;
  mainGoal: "gain_muscle" | "lose_weight" | "maintain_weight" | null;
  targetWeight: number | null;
  targetPace: "sloth" | "rabbit" | "leopard" | null;
  targetKgPerWeek: number | null;
  obstacles: string[];
  diet: number | null;
  achievements: string[];
  initial_recommended_calories: number | null;
  initial_recommended_protein_g: number | null;
  initial_recommended_carbs_g: number | null;
  initial_recommended_fats_g: number | null;
  unit_system_preference: "metric" | "imperial";
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
}

export const OnboardingContext = React.createContext<OnboardingContextType | undefined>(undefined);

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { loadOnboardingData, saveOnboardingData } = useOnboardingPersistence();
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(() => {
    // Load existing data from localStorage on initialization
    const savedData = loadOnboardingData();
    return savedData || {
      gender: null,
      trainingsPerWeek: 3,
      previousAppExperience: null,
      height: null,
      heightUnit: "cm",
      weight: null,
      weightUnit: "kg",
      bodyFatPercentage: null,
      dateOfBirth: null,
      mainGoal: null,
      targetWeight: null,
      targetPace: null,
      targetKgPerWeek: null,
      obstacles: [],
      diet: null,
      achievements: [],
      initial_recommended_calories: null,
      initial_recommended_protein_g: null,
      initial_recommended_carbs_g: null,
      initial_recommended_fats_g: null,
      unit_system_preference: "metric",
    };
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    const updatedData = {
      ...onboardingData,
      ...newData,
    };
    setOnboardingData(updatedData);
    // Persist to localStorage whenever data changes
    saveOnboardingData(updatedData);
  };

  return (
    <OnboardingContext.Provider value={{ data: onboardingData, updateData }}>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/gender" element={<Gender />} />
        <Route path="/training-frequency" element={<TrainingFrequency />} />
        <Route path="/previous-experience" element={<PreviousExperience />} />
        <Route path="/progress-comparison" element={<ProgressComparison />} />
        <Route path="/physical-data" element={<PhysicalData />} />
        <Route path="/birth-date" element={<BirthDate />} />
        <Route path="/main-goal" element={<MainGoal />} />
        <Route path="/target-weight" element={<TargetWeight />} />
        <Route path="/goal-realism" element={<GoalRealism />} />
        <Route path="/desired-pace" element={<DesiredPace />} />
        <Route path="/common-obstacles" element={<CommonObstacles />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/desired-achievements" element={<DesiredAchievements />} />
        <Route path="/gratitude" element={<Gratitude />} />
        <Route path="/initial-recommendation" element={<InitialRecommendation />} />
        <Route path="/features-preview" element={<FeaturesPreview />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app-transition" element={<AppTransition />} />
        <Route path="*" element={<Navigate to="/onboarding/welcome" replace />} />
      </Routes>
    </OnboardingContext.Provider>
  );
};

export default OnboardingFlow;
