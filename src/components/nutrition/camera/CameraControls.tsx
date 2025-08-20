
import React from 'react';
import { Camera, Image, X, RotateCcw, ImageIcon, Loader } from 'lucide-react';
import Button from '@/components/Button';

interface CameraControlsProps {
  onClose: () => void;
  onSwitchCamera: () => void;
  onCapturePhoto: () => void;
  onGallerySelect: () => void;
  isProcessing: boolean;
  isLoading: boolean;
  cameraError: string | null;
  showNoFoodDialog: boolean;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onClose,
  onSwitchCamera,
  onCapturePhoto,
  onGallerySelect,
  isProcessing,
  isLoading,
  cameraError,
  showNoFoodDialog
}) => {
  return (
    <>
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 rounded-full p-0 bg-black/20"
            disabled={isProcessing || isLoading}
          >
            <X className="h-5 w-5 text-white" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onSwitchCamera}
            className="h-10 w-10 rounded-full p-0 bg-black/20"
            disabled={isProcessing || isLoading || !!cameraError || showNoFoodDialog}
          >
            <RotateCcw className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="flex flex-col items-center gap-4">
          {/* Controls row */}
          <div className="flex items-center justify-between w-full max-w-sm">
            {/* Gallery Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onGallerySelect}
              className="h-12 px-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center gap-2 hover:bg-white/30 transition-all duration-200"
              disabled={isProcessing || isLoading || showNoFoodDialog}
            >
              <ImageIcon className="h-4 w-4 text-white" />
              <span className="text-white text-sm">Galería</span>
            </Button>

            {/* Capture Button */}
            <Button
              variant="primary"
              onClick={onCapturePhoto}
              className="h-20 w-20 rounded-full p-0 bg-white shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:scale-105 transition-all duration-200 border-4 border-white/90"
              disabled={isProcessing || isLoading || !!cameraError || showNoFoodDialog}
            >
              {isProcessing || isLoading ? (
                <Loader className="h-8 w-8 text-gray-800 animate-spin" />
              ) : (
                <Camera className="h-8 w-8 text-gray-800" />
              )}
            </Button>

            {/* Spacer for balance */}
            <div className="h-12 w-20" />
          </div>
        </div>
      </div>
    </>
  );
};
