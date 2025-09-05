import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BlockType, BLOCK_TYPE_OPTIONS, BlockTypeOption } from "../../types/blocks";
import { Flame, Zap } from "lucide-react";

interface BlockTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: BlockType) => void;
}

const getBlockIcon = (type: BlockType) => {
  switch (type) {
    case "warmup":
      return <Flame className="h-5 w-5" />;
    case "effective_sets":
      return <Zap className="h-5 w-5" />;
    default:
      return null;
  }
};

export const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  const handleSelect = (type: BlockType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tipo de Bloque</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 p-4">
          {BLOCK_TYPE_OPTIONS.map((option: BlockTypeOption) => (
            <Button
              key={option.value}
              variant="outline"
              className="w-full h-auto p-4 justify-start"
              onClick={() => handleSelect(option.value)}
            >
              <div className="flex items-center space-x-3">
                {getBlockIcon(option.value)}
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};