
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, X, RotateCcw, ImageIcon, Loader } from 'lucide-react';
import Button from '@/components/Button';
import { useFoodCapture } from '@/hooks/useFoodCapture';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured: (imageUrl: string, analysisResult?: any) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onImageCaptured
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { uploadImageWithAnalysis, sendToWebhook, captureFromGallery, isLoading } = useFoodCapture();

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
      // Fallback to any available camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        setStream(fallbackStream);
        
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
        console.log('Capturing photo from camera, uploading to Supabase...');
        const result = await uploadImageWithAnalysis(blob);
        if (result) {
          console.log('Image uploaded and analyzed successfully:', result);
          onImageCaptured(result.imageUrl, result.analysisResult);
          onClose();
        }
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleGallerySelect = async () => {
    console.log('Opening gallery selection through hook...');
    setIsProcessing(true);
    
    // Use the hook's gallery function which now includes analysis
    const result = await captureFromGallery();
    if (result) {
      console.log('Gallery image processed and analyzed successfully:', result);
      onImageCaptured(result.imageUrl, result.analysisResult);
      onClose();
    } else {
      console.log('No image selected from gallery or upload failed');
    }
    setIsProcessing(false);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100]">
      <div className="relative w-full h-full">
        {/* Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClose}
              className="h-10 w-10 rounded-full p-0 bg-black/20"
              disabled={isProcessing || isLoading}
            >
              <X className="h-5 w-5 text-white" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={switchCamera}
              className="h-10 w-10 rounded-full p-0 bg-black/20"
              disabled={isProcessing || isLoading}
            >
              <RotateCcw className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-between">
            {/* Gallery Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGallerySelect}
              className="h-14 px-4 rounded-full bg-black/20 flex items-center gap-2"
              disabled={isProcessing || isLoading}
            >
              <ImageIcon className="h-5 w-5 text-white" />
              <span className="text-white text-sm">Galería</span>
            </Button>

            {/* Capture Button */}
            <Button
              variant="primary"
              onClick={capturePhoto}
              className="h-16 w-16 rounded-full p-0 bg-white"
              disabled={isProcessing || isLoading}
            >
              {isProcessing || isLoading ? (
                <Loader className="h-8 w-8 text-black animate-spin" />
              ) : (
                <Camera className="h-8 w-8 text-black" />
              )}
            </Button>

            {/* Placeholder for balance */}
            <div className="h-14 w-20" />
          </div>
        </div>

        {/* Loading Overlay */}
        {(isProcessing || isLoading) && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="neu-card p-6 text-center max-w-xs mx-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
              <p className="text-white font-medium mb-1">Analizando imagen</p>
              <p className="text-white/70 text-sm">
                Detectando alimentos y calculando nutrientes...
              </p>
            </div>
          </div>
        )}

        {/* Camera Viewfinder Grid */}
        {!isProcessing && !isLoading && (
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
        )}
      </div>
    </div>
  );
};
