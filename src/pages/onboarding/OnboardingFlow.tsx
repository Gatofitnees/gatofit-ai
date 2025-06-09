import React, { createContext, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Welcome from "./steps/Welcome";
import Gender from "./steps/Gender";
import BirthDate from "./steps/BirthDate";
import MainGoal from "./steps/MainGoal";
import TargetWeight from "./steps/TargetWeight";
import ProgressComparison from "./steps/ProgressComparison";
import PhysicalData from "./steps/PhysicalData";
import PreviousExperience from "./steps/PreviousExperience";
import TrainingFrequency from "./steps/TrainingFrequency";
import Diet from "./steps/Diet";
import GoalRealism from "./steps/GoalRealism";
import DesiredPace from "./steps/DesiredPace";
import CommonObstacles from "./steps/CommonObstacles";
import DesiredAchievements from "./steps/DesiredAchievements";
import Gratitude from "./steps/Gratitude";
import InitialRecommendation from "./steps/InitialRecommendation";
import FeaturesPreview from "./steps/FeaturesPreview";
import CreateAccount from "./steps/CreateAccount";
import Login from "./steps/Login";
import AppTransition from "./steps/AppTransition";

// Define the structure of the onboarding data
export interface OnboardingData {
  gender?: "male" | "female" | "other";
  birthDate?: string;
  dateOfBirth?: Date | string;
  mainGoal?: "lose_weight" | "gain_muscle" | "maintain_weight" | "improve_health";
  targetWeight?: number;
  height?: number;
  heightUnit?: "cm" | "ft-in";
  weight?: number;
  weightUnit?: "kg" | "lbs";
  bodyFatPercentage?: number;
  unit_system_preference?: "metric" | "imperial";
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  trainingFrequency?: number;
  trainingsPerWeek?: number;
  previousAppExperience?: boolean;
  dietPreference?: "omnivore" | "vegetarian" | "vegan" | "keto" | "paleo" | "mediterranean";
  diet?: number;
  desiredPace?: "slow" | "moderate" | "fast";
  targetPace?: "sloth" | "rabbit" | "leopard";
  targetKgPerWeek?: number;
  commonObstacles?: string[];
  obstacles?: string[];
  desiredAchievements?: string[];
  achievements?: string[];
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  initial_recommended_calories?: number;
  initial_recommended_protein_g?: number;
  initial_recommended_carbs_g?: number;
  initial_recommended_fats_g?: number;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
}

export const OnboardingContext = createContext<OnboardingContextType | null>(null);

const OnboardingFlow: React.FC = () => {
  const location = useLocation();
  const [data, setData] = useState<OnboardingData>({
    achievements: [],
    obstacles: [],
    trainingsPerWeek: 3, // Default value set to 3 days
    weightUnit: "kg", // Default to metric system
    heightUnit: "cm",
    unit_system_preference: "metric"
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const pageVariants = {
    initial: { 
      opacity: 0,
      x: 30,
      scale: 0.98
    },
    in: { 
      opacity: 1,
      x: 0,
      scale: 1
    },
    out: { 
      opacity: 0,
      x: -30,
      scale: 0.98
    }
  };

  const pageTransition = {
    type: "tween",
    ease: [0.25, 0.46, 0.45, 0.94],
    duration: 0.3
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="w-full h-full"
        >
          <Routes location={location}>
            <Route path="welcome" element={<Welcome />} />
            <Route path="gender" element={<Gender />} />
            <Route path="birth-date" element={<BirthDate />} />
            <Route path="main-goal" element={<MainGoal />} />
            <Route path="target-weight" element={<TargetWeight />} />
            <Route path="progress-comparison" element={<ProgressComparison />} />
            <Route path="physical-data" element={<PhysicalData />} />
            <Route path="previous-experience" element={<PreviousExperience />} />
            <Route path="training-frequency" element={<TrainingFrequency />} />
            <Route path="diet" element={<Diet />} />
            <Route path="goal-realism" element={<GoalRealism />} />
            <Route path="desired-pace" element={<DesiredPace />} />
            <Route path="common-obstacles" element={<CommonObstacles />} />
            <Route path="desired-achievements" element={<DesiredAchievements />} />
            <Route path="gratitude" element={<Gratitude />} />
            <Route path="initial-recommendation" element={<InitialRecommendation />} />
            <Route path="features-preview" element={<FeaturesPreview />} />
            <Route path="create-account" element={<CreateAccount />} />
            <Route path="login" element={<Login />} />
            <Route path="app-transition" element={<AppTransition />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </OnboardingContext.Provider>
  );
};

export default OnboardingFlow;
