import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/Button";
import { BlockType } from "../../types";

interface BlockTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: BlockType) => void;
}

const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  const blockTypes = [
    { type: "calentamiento" as BlockType, title: "Calentamiento", description: "Ejercicios de preparación" },
    { type: "series_efectivas" as BlockType, title: "Series Efectivas", description: "Ejercicios principales" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Tipo de Bloque</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {blockTypes.map(({ type, title, description }) => (
            <Button
              key={type}
              variant="outline"
              className="w-full h-auto p-4 justify-start"
              onClick={() => {
                onSelectType(type);
                onClose();
              }}
            >
              <div className="text-left">
                <div className="font-medium">{title}</div>
                <div className="text-sm text-muted-foreground">{description}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockTypeSelector;