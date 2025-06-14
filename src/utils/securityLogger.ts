export interface SecurityLogEntry {
  timestamp: string;
  eventType: string;
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  userAgent?: string;
  ipAddress?: string;
  location?: string;
}

export const logAuthEvent = (
  eventType: string, 
  userId?: string, 
  severity: 'low' | 'medium' | 'high' = 'low',
  additionalDetails?: string
) => {
  const logEntry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    eventType: `auth_${eventType}`,
    userId: userId || undefined,
    details: additionalDetails || eventType,
    severity,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    location: typeof window !== 'undefined' ? window.location.href : undefined
  };

  logSecurityEvent(logEntry);
};

export const logDataAccessEvent = (
  eventType: string,
  userId: string,
  resourceType: string,
  resourceId?: string,
  severity: 'low' | 'medium' | 'high' = 'low'
) => {
  const logEntry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    eventType: `data_access_${eventType}`,
    userId,
    details: `${resourceType}${resourceId ? `:${resourceId}` : ''}`,
    severity,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    location: typeof window !== 'undefined' ? window.location.href : undefined
  };

  logSecurityEvent(logEntry);
};

export const logSecurityEvent = (logEntry: SecurityLogEntry) => {
  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    const logColor = logEntry.severity === 'high' ? 'red' : 
                     logEntry.severity === 'medium' ? 'orange' : 'blue';
    console.log(
      `%c[SECURITY ${logEntry.severity.toUpperCase()}] ${logEntry.eventType}`,
      `color: ${logColor}; font-weight: bold;`,
      logEntry
    );
  }

  // Store in session storage for debugging (client-side only)
  if (typeof window !== 'undefined') {
    try {
      const existingLogs = JSON.parse(sessionStorage.getItem('security_audit_log') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 entries
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      sessionStorage.setItem('security_audit_log', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to store security log:', error);
    }
  }

  // In production, send to your logging service
  // This could be Sentry, LogRocket, or your own service
  if (process.env.NODE_ENV === 'production' && logEntry.severity !== 'low') {
    // Example: Send to external logging service
    // sendToLoggingService(logEntry);
  }
};

export const getSecurityLogs = (): SecurityLogEntry[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(sessionStorage.getItem('security_audit_log') || '[]');
  } catch {
    return [];
  }
};

export const clearSecurityLogs = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('security_audit_log');
  }
};
