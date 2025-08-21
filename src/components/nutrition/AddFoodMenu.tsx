import React, { useState } from 'react';
import { Camera, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface AddFoodMenuProps {
  onCameraClick: () => void;
}

const AddFoodMenu: React.FC<AddFoodMenuProps> = ({ onCameraClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchFood = () => {
    setIsOpen(false);
    navigate('/nutrition/search');
  };

  const handleCameraClick = () => {
    setIsOpen(false);
    onCameraClick();
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <span className="text-primary-foreground text-2xl font-light">+</span>
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          >
            <div className="fixed bottom-40 right-6 flex flex-col-reverse gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="flex items-center gap-3"
              >
                <span className="bg-background/95 backdrop-blur-sm px-3 py-2 rounded-full text-sm text-foreground whitespace-nowrap shadow-lg border border-border/50 font-medium">
                  Buscar comida
                </span>
                <button
                  onClick={handleSearchFood}
                  className="flex items-center justify-center w-14 h-14 bg-[#2094F3] hover:bg-[#1976D2] text-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <Search className="w-6 h-6" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 300 }}
                className="flex items-center gap-3"
              >
                <span className="bg-background/95 backdrop-blur-sm px-3 py-2 rounded-full text-sm text-foreground whitespace-nowrap shadow-lg border border-border/50 font-medium">
                  Escanear
                </span>
                <button
                  onClick={handleCameraClick}
                  className="flex items-center justify-center w-14 h-14 bg-[#2094F3] hover:bg-[#1976D2] text-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddFoodMenu;