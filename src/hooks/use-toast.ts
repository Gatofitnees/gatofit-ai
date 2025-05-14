
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

const useToast = () => {
  const toast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
    action,
  }: ToastProps) => {
    // Map variant to sonner variants
    const variantStyle = 
      variant === "destructive" ? { style: { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" } } :
      variant === "success" ? { style: { backgroundColor: "hsl(var(--success))", color: "hsl(var(--success-foreground))" } } :
      {};

    return sonnerToast(title, {
      description,
      duration,
      ...variantStyle,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    });
  };

  return { toast };
};

const toast = (props: ToastProps) => {
  const { toast: showToast } = useToast();
  return showToast(props);
};

export { useToast, toast };
