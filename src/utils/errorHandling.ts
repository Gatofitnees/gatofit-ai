
// Enhanced error handling with security considerations
export const createSecureErrorMessage = (error: any, context: string): string => {
  console.error(`Error in ${context}:`, error);
  
  // Generic error messages to prevent information disclosure
  const secureMessages: Record<string, string> = {
    'network': 'Error de conexión. Inténtalo de nuevo.',
    'auth': 'Error de autenticación. Verifica tus credenciales.',
    'validation': 'Los datos ingresados no son válidos.',
    'file': 'Error al procesar el archivo.',
    'database': 'Error interno. Inténtalo más tarde.',
    'webhook': 'Error al procesar la imagen. Inténtalo de nuevo.',
    'default': 'Ha ocurrido un error inesperado.'
  };
  
  // Determine error type and return appropriate message
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return secureMessages.network;
  }
  
  if (error?.message?.includes('auth') || error?.code === 'PGRST301') {
    return secureMessages.auth;
  }
  
  if (error?.message?.includes('validation') || error?.code?.includes('23')) {
    return secureMessages.validation;
  }
  
  return secureMessages[context] || secureMessages.default;
};

export const logSecurityEvent = (event: string, details: any, userId?: string): void => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    userId: userId || 'anonymous',
    userAgent: navigator.userAgent,
    // Only log safe details, never sensitive data
    details: typeof details === 'string' ? details : 'Security event occurred'
  };
  
  console.warn('Security Event:', securityLog);
  
  // In production, you would send this to a secure logging service
  // Example: sendToSecurityService(securityLog);
};
