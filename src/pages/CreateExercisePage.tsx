
import React from "react";
import { useCreateExercise } from "@/features/create-exercise/hooks/useCreateExercise";
import CreateExerciseHeader from "@/features/create-exercise/components/CreateExerciseHeader";
import MediaUpload from "@/features/create-exercise/components/MediaUpload";
import ExerciseForm from "@/features/create-exercise/components/ExerciseForm";

const CreateExercisePage: React.FC = () => {
  const {
    formState,
    setters,
    mediaHandlers,
    actionHandlers,
    saving,
  } = useCreateExercise();

  return (
    <div 
      className="min-h-screen pb-24 max-w-md mx-auto"
      style={{
        paddingTop: 'var(--safe-area-inset-top)',
        paddingLeft: 'var(--safe-area-inset-left)',
        paddingRight: 'var(--safe-area-inset-right)',
      }}
    >
      <CreateExerciseHeader
        onCancel={actionHandlers.handleCancel}
        onSave={actionHandlers.handleSave}
        saving={saving}
      />

      <div className="p-4 space-y-6">
        <MediaUpload
          mediaPreview={formState.mediaPreview}
          mediaFile={formState.mediaFile}
          onFileChange={mediaHandlers.handleFileChange}
          onRemoveMedia={mediaHandlers.removeMedia}
        />

        <ExerciseForm
          formState={formState}
          setters={setters}
        />
      </div>
    </div>
  );
};

export default CreateExercisePage;
