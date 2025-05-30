
import React, { useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string;
  onAvatarUpdate?: (newUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName,
  onAvatarUpdate,
  size = 'lg'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, uploading } = useAvatarUpload();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newUrl = await uploadAvatar(file);
    if (newUrl && onAvatarUpdate) {
      onAvatarUpdate(newUrl);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-primary/20`}>
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
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          Galería
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Cámara
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        capture="environment"
      />
    </div>
  );
};

export default AvatarUpload;
