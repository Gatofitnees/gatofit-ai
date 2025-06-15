
import React from 'react';
import { Image } from 'lucide-react';

interface ExercisePreviewProps {
  videoUrl?: string;
  imageUrl?: string;
  exerciseName: string;
}

const ExercisePreview: React.FC<ExercisePreviewProps> = ({ videoUrl, imageUrl, exerciseName }) => {
  return (
    <div className="w-12 h-12 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-border/60">
      {videoUrl ? (
        <video
          // By adding #t=0.1, we hint to the browser that it should load the frame at 0.1 seconds
          // This is a common and efficient trick for showing video thumbnails.
          src={`${videoUrl}#t=0.1`}
          muted
          playsInline
          preload="metadata" // Only load metadata to get the first frame, not the whole video
          className="w-full h-full object-cover"
          aria-label={`Preview for ${exerciseName}`}
        />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={`Preview for ${exerciseName}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <Image className="w-6 h-6 text-muted-foreground" />
      )}
    </div>
  );
};

export default ExercisePreview;
