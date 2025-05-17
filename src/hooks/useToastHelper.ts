
import { useToast } from "@/hooks/use-toast";

export function useToastHelper() {
  const { toast } = useToast();

  return {
    showSuccess: (title: string, description?: string) => {
      return toast({
        title,
        description,
        variant: "success"
      });
    },
    showError: (title: string, description?: string) => {
      return toast({
        title,
        description,
        variant: "destructive" 
      });
    },
    showInfo: (title: string, description?: string) => {
      return toast({
        title,
        description
      });
    }
  };
}
