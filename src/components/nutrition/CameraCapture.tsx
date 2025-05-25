
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, X, RotateCcw } from 'lucide-react';
import Button from '@/components/Button';
import { useFoodCapture } from '@/hooks/useFoodCapture';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured: (imageUrl: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onImageCaptured
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { captureFromGallery, uploadImage } = useFoodCapture();

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const result = await uploadImage(blob);
        if (result) {
          onImageCaptured(result.imageUrl);
          onClose();
        }
      }
    }, 'image/jpeg', 0.8);
  };

  const handleGallerySelect = async () => {
    const result = await captureFromGallery();
    if (result) {
      onImageCaptured(result.imageUrl);
      onClose();
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
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
              onClick={onClose}
              className="h-10 w-10 rounded-full p-0 bg-black/20"
            >
              <X className="h-5 w-5 text-white" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={switchCamera}
              className="h-10 w-10 rounded-full p-0 bg-black/20"
            >
              <RotateCcw className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-6">
            {/* Gallery Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGallerySelect}
              className="h-12 w-12 rounded-full p-0 bg-black/20"
            >
              <Image className="h-6 w-6 text-white" />
            </Button>

            {/* Capture Button */}
            <Button
              variant="primary"
              onClick={capturePhoto}
              className="h-16 w-16 rounded-full p-0 bg-white"
            >
              <Camera className="h-8 w-8 text-black" />
            </Button>

            {/* Placeholder for balance */}
            <div className="h-12 w-12" />
          </div>
        </div>

        {/* Camera Viewfinder Grid */}
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
      </div>
    </div>
  );
};
