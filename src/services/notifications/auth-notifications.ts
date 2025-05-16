
import { toast } from "@/components/ui/use-toast";

/**
 * Service responsible for managing authentication-related notifications
 */
export const authNotifications = {
  signUpSuccess: () => {
    toast({
      title: "Cuenta creada",
      description: "Por favor, verifica tu email",
    });
  },
  
  signUpError: (message: string) => {
    toast({
      title: "Error de registro",
      description: message,
      variant: "destructive",
    });
  },
  
  profileCreationError: (message: string) => {
    toast({
      title: "Error al crear perfil",
      description: message,
      variant: "destructive",
    });
  },
  
  signInSuccess: () => {
    toast({
      title: "¡Bienvenido de nuevo!",
      description: "Sesión iniciada exitosamente",
    });
  },
  
  signInError: (message: string) => {
    toast({
      title: "Error de inicio de sesión",
      description: message,
      variant: "destructive",
    });
  },
  
  googleSignInError: (message: string) => {
    toast({
      title: "Error al iniciar sesión con Google",
      description: message,
      variant: "destructive",
    });
  },
  
  genericError: (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  
  signOutSuccess: () => {
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  },
  
  signedInWelcome: () => {
    toast({
      title: "¡Bienvenido!",
      description: "Has iniciado sesión exitosamente",
    });
  }
};
