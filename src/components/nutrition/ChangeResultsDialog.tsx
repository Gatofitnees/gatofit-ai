
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/Button';
import { X, Sparkles, Send } from 'lucide-react';

interface ChangeResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: string) => void;
}

export const ChangeResultsDialog: React.FC<ChangeResultsDialogProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [request, setRequest] = useState('');

  const handleSubmit = () => {
    if (request.trim()) {
      onSubmit(request.trim());
      setRequest('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border border-white/10 max-w-md mx-auto rounded-xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Cambiar resultados con IA
          </DialogTitle>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-secondary/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              ¿Qué te gustaría cambiar?
            </label>
            <Textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="Ej: Este no es un sandwich, es una ensalada..."
              className="min-h-[100px] resize-none"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!request.trim()}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
