
import React from 'react';
import { Image } from 'lucide-react';

interface ExercisePreviewProps {
  imageUrl?: string;
  exerciseName: string;
}

const ExercisePreview: React.FC<ExercisePreviewProps> = ({ imageUrl, exerciseName }) => {
  return (
    <div className="w-12 h-12 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-border/60">
      {imageUrl ? (
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
