
import React, { useState, useRef, useEffect } from 'react';
import { CameraControls } from './camera/CameraControls';
import { CameraErrorDialog } from './camera/CameraErrorDialog';
import { CameraLoadingOverlay } from './camera/CameraLoadingOverlay';
import { CameraViewfinder } from './camera/CameraViewfinder';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured: (imageUrl: string, imageBlob?: Blob) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onImageCaptured
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      // Hide navigation bar when camera is open
      const navBar = document.querySelector('nav');
      if (navBar) {
        (navBar as HTMLElement).style.display = 'none';
      }
    } else {
      stopCamera();
      // Show navigation bar when camera is closed
      const navBar = document.querySelector('nav');
      if (navBar) {
        (navBar as HTMLElement).style.display = '';
      }
    }

    return () => {
      stopCamera();
      // Ensure navigation bar is shown when component unmounts
      const navBar = document.querySelector('nav');
      if (navBar) {
        (navBar as HTMLElement).style.display = '';
      }
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Error al acceder a la cámara';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Permisos de cámara denegados. Permite el acceso para tomar fotos.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No se encontró ninguna cámara en este dispositivo.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'La cámara está siendo usada por otra aplicación.';
        }
      }
      
      setCameraError(errorMessage);
      
      // Fallback to any available camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        setStream(fallbackStream);
        setCameraError(null);
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackError) {
        console.error('Error accessing any camera:', fallbackError);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    setIsProcessing(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        console.log('Photo captured from camera');
        
        // Create a temporary URL for the image
        const imageUrl = URL.createObjectURL(blob);
        
        // Call the callback with both URL and blob
        onImageCaptured(imageUrl, blob);
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleGallerySelect = async () => {
    console.log('Opening gallery selection...');
    setIsProcessing(true);
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Gallery file selected:', file.name);
        
        // Create a URL for the selected file
        const imageUrl = URL.createObjectURL(file);
        
        // Call the callback with both URL and file (which is a Blob)
        onImageCaptured(imageUrl, file);
      }
      setIsProcessing(false);
    };

    input.oncancel = () => {
      console.log('Gallery selection cancelled');
      setIsProcessing(false);
    };

    input.click();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100]">
      <div className="relative w-full h-full">
        <CameraErrorDialog
          isVisible={!!cameraError}
          errorMessage={cameraError || ''}
          onUseGallery={handleGallerySelect}
          onRetryCamera={startCamera}
          isProcessing={isProcessing}
          isLoading={false}
        />

        {/* Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        <canvas ref={canvasRef} className="hidden" />

        <CameraControls
          onClose={onClose}
          onSwitchCamera={switchCamera}
          onCapturePhoto={capturePhoto}
          onGallerySelect={handleGallerySelect}
          isProcessing={isProcessing}
          isLoading={false}
          cameraError={cameraError}
          showNoFoodDialog={false}
        />

        <CameraLoadingOverlay
          isVisible={isProcessing && !cameraError}
        />

        <CameraViewfinder
          isVisible={!isProcessing && !cameraError}
        />
      </div>
    </div>
  );
};
