
import React, { useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string;
  onAvatarUpdate?: (newUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  isPremium?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName,
  onAvatarUpdate,
  size = 'lg',
  isPremium = false
}) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, uploading } = useAvatarUpload();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const crownSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newUrl = await uploadAvatar(file);
    if (newUrl && onAvatarUpdate) {
      onAvatarUpdate(newUrl);
    }
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <Avatar className={cn(
          sizeClasses[size], 
          "border-2",
          isPremium ? "border-yellow-400/40" : "border-primary/20"
        )}>
          <AvatarImage src={currentAvatar || undefined} alt={userName || 'Avatar'} />
          <AvatarFallback className="text-lg font-bold">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}

        {/* Premium Crown - Positioned at top-left corner, rotated 45 degrees */}
        {isPremium && (
          <div className="absolute -top-1 -left-1 z-10">
            <div className="relative">
              <Crown 
                className={cn(
                  crownSizes[size],
                  "text-yellow-400 transform rotate-45 drop-shadow-lg"
                )}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                }}
              />
              {/* Subtle glow effect */}
              <Crown 
                className={cn(
                  crownSizes[size],
                  "absolute top-0 left-0 text-yellow-300 transform rotate-45 opacity-60"
                )}
                style={{
                  filter: 'blur(2px)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGalleryClick}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          Galería
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCameraClick}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Cámara
        </Button>
      </div>

      {/* Separate inputs for gallery and camera */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        capture="user"
      />
    </div>
  );
};

export default AvatarUpload;
