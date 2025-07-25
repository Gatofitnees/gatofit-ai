
import React, { useState } from "react";
import { Plus, Calendar, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionMenuProps {
  onCreateRoutine: () => void;
  onCreateProgram: () => void;
  onOpenGatofitPrograms: () => void;
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ 
  onCreateRoutine, 
  onCreateProgram,
  onOpenGatofitPrograms
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed right-4 bottom-20 z-30">
      {/* Background overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3 mb-4">
        {/* Gatofit Programs button */}
        <div 
          className={cn(
            "transition-all duration-300 transform relative",
            isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          )}
        >
          <button
            onClick={() => {
              onOpenGatofitPrograms();
              setIsOpen(false);
            }}
            className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Galactic aura border */}
            <div 
              className="absolute inset-0 rounded-full opacity-75 animate-pulse"
              style={{
                background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
                padding: '2px'
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
            </div>
            
            {/* Inner content with full circular image */}
            <div className="relative z-10 w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img 
                src="https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/gatofit%20logo%20APP.png" 
                alt="Gatofit Logo" 
                className="w-8 h-8 object-cover rounded-full"
              />
            </div>
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground whitespace-nowrap shadow-lg border border-border/50">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold drop-shadow-sm" style={{
              textShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)'
            }}>
              Programas Gatofit
            </span>
          </span>
        </div>

        {/* Create Program button */}
        <div 
          className={cn(
            "transition-all duration-300 transform",
            isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          )}
        >
          <button
            onClick={() => {
              onCreateProgram();
              setIsOpen(false);
            }}
            className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Calendar className="h-6 w-6" />
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground whitespace-nowrap shadow-lg border border-border/50">
            Crear Programación
          </span>
        </div>

        {/* Create Routine button */}
        <div 
          className={cn(
            "transition-all duration-300 transform",
            isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          )}
        >
          <button
            onClick={() => {
              onCreateRoutine();
              setIsOpen(false);
            }}
            className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Dumbbell className="h-6 w-6" />
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground whitespace-nowrap shadow-lg border border-border/50">
            Crear Rutina
          </span>
        </div>
      </div>

      {/* Main toggle button */}
      <button
        onClick={toggleMenu}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          isOpen 
            ? "bg-red-500 hover:bg-red-600 text-white rotate-45" 
            : "bg-blue-500 hover:bg-blue-600 text-white hover:scale-110"
        )}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default FloatingActionMenu;
