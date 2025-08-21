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
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center z-50"
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
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          >
            <div className="fixed bottom-24 right-6 flex flex-col gap-3">
              <motion.button
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -180 }}
                transition={{ delay: 0.1 }}
                onClick={handleSearchFood}
                className="flex items-center gap-3 bg-card rounded-full shadow-lg px-4 py-3 min-w-[160px]"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-foreground font-medium">Buscar comida</span>
              </motion.button>

              <motion.button
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -180 }}
                transition={{ delay: 0.05 }}
                onClick={handleCameraClick}
                className="flex items-center gap-3 bg-card rounded-full shadow-lg px-4 py-3 min-w-[160px]"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-foreground font-medium">Escanear</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddFoodMenu;