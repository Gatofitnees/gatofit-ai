
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SelectableCardProps {
  selected?: boolean;
  onSelect?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

const SelectableCard: React.FC<SelectableCardProps> = ({
  selected = false,
  onSelect,
  children,
  icon,
  label,
  className,
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative p-4 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
        selected
          ? "neu-button-active bg-primary/10"
          : "neu-button bg-secondary/20 hover:bg-secondary/30",
        className
      )}
    >
      <div className="flex flex-col items-center">
        {icon && <div className="text-primary mb-2">{icon}</div>}
        {label && <h4 className="font-medium text-sm mb-2">{label}</h4>}
        {children}
        
        {selected && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M4 6.5L5.5 8L8 4" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SelectableCard;
