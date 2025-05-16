
import { toast } from "@/components/ui/use-toast";

/**
 * Service responsible for managing authentication-related notifications
 */
export const authNotifications = {
  signUpSuccess: () => {
    toast.show({
      title: "Cuenta creada",
      description: "Por favor, verifica tu email",
    });
  },
  
  signUpError: (message: string) => {
    toast.error({
      title: "Error de registro",
      description: message,
    });
  },
  
  profileCreationError: (message: string) => {
    toast.error({
      title: "Error al crear perfil",
      description: message,
    });
  },
  
  signInSuccess: () => {
    toast.success({
      title: "¡Bienvenido de nuevo!",
      description: "Sesión iniciada exitosamente",
    });
  },
  
  signInError: (message: string) => {
    toast.error({
      title: "Error de inicio de sesión",
      description: message,
    });
  },
  
  googleSignInError: (message: string) => {
    toast.error({
      title: "Error al iniciar sesión con Google",
      description: message,
    });
  },
  
  genericError: (message: string) => {
    toast.error({
      title: "Error",
      description: message,
    });
  },
  
  signOutSuccess: () => {
    toast.success({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  },
  
  signedInWelcome: () => {
    toast.success({
      title: "¡Bienvenido!",
      description: "Has iniciado sesión exitosamente",
    });
  }
};
