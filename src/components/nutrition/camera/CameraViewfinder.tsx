
import React from 'react';

interface CameraViewfinderProps {
  isVisible: boolean;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="w-full h-full relative">
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-white/20" />
          ))}
        </div>
      </div>
    </div>
  );
};
