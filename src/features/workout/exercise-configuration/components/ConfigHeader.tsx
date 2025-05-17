
import React from "react";
import { ArrowLeft, Save } from "lucide-react";
import Button from "@/components/Button";

interface ConfigHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onSave: () => void;
}

const ConfigHeader: React.FC<ConfigHeaderProps> = ({ 
  title, 
  subtitle, 
  onBack, 
  onSave 
}) => {
  return (
    <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={onSave}
        >
          Guardar
        </Button>
      </div>
      {subtitle && (
        <div className="mt-2 text-sm text-muted-foreground">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default ConfigHeader;
