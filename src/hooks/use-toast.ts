
import * as React from "react";
import { toast as sonnerToast } from 'sonner';

type ToastProps = React.ComponentPropsWithoutRef<"div"> & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  onOpenChange?: (open: boolean) => void;
};

type ToastActionElement = React.ReactElement<{
  toast: typeof sonnerToast;
  className: string;
}>;

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

let count = 0;

function generateToastId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ToastState = {
  toasts: ToasterToast[];
};

const toastState = React.createContext<ToastState | undefined>(undefined);

function useToastState(): ToastState {
  const context = React.useContext(toastState);

  if (context === undefined) {
    throw new Error("useToastState must be used within a ToastProvider");
  }

  return context;
}

const ToastStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  return (
    <toastState.Provider
      value={{
        toasts,
      }}
    >
      {children}
    </toastState.Provider>
  );
};

function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  // Sync with Sonner's implementation
  const toast = React.useMemo(() => {
    const addToast = (
      props: {
        title?: React.ReactNode;
        description?: React.ReactNode;
        action?: ToastActionElement;
        variant?: "default" | "destructive" | "success";
        duration?: number;
      } = {}
    ) => {
      const {
        title,
        description,
        action,
        variant = "default",
        duration = 5000,
        ...rest
      } = props;

      const id = generateToastId();

      // Add toast to our internal state
      const newToast = {
        id,
        title,
        description,
        action,
        variant,
        duration,
      };
      
      setToasts((prev) => [...prev, newToast]);

      // Also trigger sonner toast for compatibility with existing code
      const variantStyle = 
        variant === "destructive" ? { style: { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" } } :
        variant === "success" ? { style: { backgroundColor: "hsl(var(--success, 142 71% 45%))", color: "hsl(var(--success-foreground, 210 40% 98%))" } } :
        {};

      sonnerToast(title as string, {
        description: description as string,
        duration,
        ...variantStyle,
        ...rest,
      });

      return id;
    };

    return Object.assign(addToast, {
      dismiss: (toastId?: string) => {
        if (toastId) {
          setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
        }
      },
      error: (props: any) => addToast({ ...props, variant: "destructive" }),
      success: (props: any) => addToast({ ...props, variant: "success" }),
    });
  }, []);

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      if (toastId) {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      }
    },
  };
}

export { useToast, ToastStateProvider, toast };
export type { ToastProps, ToastActionElement };
