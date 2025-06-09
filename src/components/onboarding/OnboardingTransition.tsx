
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTransitionProps {
  children: React.ReactNode;
  direction?: "forward" | "backward";
}

const OnboardingTransition: React.FC<OnboardingTransitionProps> = ({ 
  children, 
  direction = "forward" 
}) => {
  const variants = {
    enter: {
      x: direction === "forward" ? "100%" : "-100%",
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: direction === "forward" ? "-100%" : "100%",
      opacity: 0,
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        type: "tween",
        ease: [0.25, 0.46, 0.45, 0.94],
        duration: 0.3,
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default OnboardingTransition;
