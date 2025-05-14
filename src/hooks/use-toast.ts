
import * as React from "react";
import { toast as sonnerToast } from "sonner";

// Define types for toast functionality
export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

const TOAST_LIMIT = 20;
export const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        const timeout = toastTimeouts.get(toastId);
        if (timeout) clearTimeout(timeout);

        toastTimeouts.set(
          toastId,
          setTimeout(() => {
            toastTimeouts.delete(toastId);
            dispatch({
              type: "REMOVE_TOAST",
              toastId: toastId,
            });
          }, TOAST_REMOVE_DELAY)
        );
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function useToast() {
  const [state, setState] = React.useState<State>({ toasts: [] });

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  const toast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
    action,
  }: ToastProps) => {
    const id = genId();
    const toastProps = {
      id,
      title,
      description,
      action,
      variant,
      duration,
      open: true,
    };

    dispatch({
      type: "ADD_TOAST",
      toast: toastProps,
    });

    // Also trigger sonner toast for compatibility with existing code
    const variantStyle = 
      variant === "destructive" ? { style: { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" } } :
      variant === "success" ? { style: { backgroundColor: "hsl(var(--success))", color: "hsl(var(--success-foreground))" } } :
      {};

    sonnerToast(title, {
      description,
      duration,
      ...variantStyle,
      action: action
        ? {
            label: typeof action === 'object' && action !== null && 'label' in action 
              ? String(action.label) 
              : 'Action',
            onClick: typeof action === 'object' && action !== null && 'onClick' in action 
              ? action.onClick as () => void
              : () => {},
          }
        : undefined,
    });
    
    return id;
  };

  return {
    toast,
    toasts: state.toasts,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

type ToastActionElement = React.ReactElement<{
  altText: string;
  onClick: () => void;
}>;

export const toast = ({ ...props }: ToastProps) => {
  const { toast } = useToast();
  return toast(props);
};
