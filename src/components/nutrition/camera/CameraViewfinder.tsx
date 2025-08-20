
import React from 'react';

interface CameraViewfinderProps {
  isVisible: boolean;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative">
        {/* Main frame box */}
        <div className="w-80 h-80 border border-white/60 rounded-3xl relative bg-transparent">
          {/* Corner indicators - subtle lines only */}
          <div className="absolute top-3 left-3 w-5 h-5">
            <div className="w-full h-0.5 bg-white/80 rounded-full"></div>
            <div className="w-0.5 h-full bg-white/80 rounded-full absolute top-0 left-0"></div>
          </div>
          <div className="absolute top-3 right-3 w-5 h-5">
            <div className="w-full h-0.5 bg-white/80 rounded-full"></div>
            <div className="w-0.5 h-full bg-white/80 rounded-full absolute top-0 right-0"></div>
          </div>
          <div className="absolute bottom-3 left-3 w-5 h-5">
            <div className="w-full h-0.5 bg-white/80 rounded-full absolute bottom-0"></div>
            <div className="w-0.5 h-full bg-white/80 rounded-full absolute bottom-0 left-0"></div>
          </div>
          <div className="absolute bottom-3 right-3 w-5 h-5">
            <div className="w-full h-0.5 bg-white/80 rounded-full absolute bottom-0"></div>
            <div className="w-0.5 h-full bg-white/80 rounded-full absolute bottom-0 right-0"></div>
          </div>
        </div>
        
        {/* Instructional text */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <p className="text-white/90 text-center text-sm font-medium">
            Centra la comida en el marco
          </p>
          <p className="text-white/70 text-center text-xs mt-1">
            Asegúrate de que esté bien iluminada
          </p>
        </div>
      </div>
    </div>
  );
};
