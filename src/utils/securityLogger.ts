// Enhanced security event logging
export type SecurityEventLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  timestamp: string;
  level: SecurityEventLevel;
  event: string;
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  logEvent(
    event: string,
    description: string,
    level: SecurityEventLevel = 'low',
    userId?: string
  ): void {
    const securityEvent: SecurityEvent = {
      timestamp: new Date().toISOString(),
      level,
      event,
      description,
      userId,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    this.events.unshift(securityEvent);
    
    // Keep only the latest events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Console log for development
    console.log(`[SECURITY ${level.toUpperCase()}] ${event}: ${description}`);

    // In production, you might want to send critical events to a monitoring service
    if (level === 'critical' || level === 'high') {
      this.sendToMonitoring(securityEvent);
    }
  }

  private getClientIP(): string {
    // In a real application, this would be obtained from the server
    return 'client_ip_not_available';
  }

  private sendToMonitoring(event: SecurityEvent): void {
    // In production, send to monitoring service
    // For now, just log to console
    console.error('CRITICAL SECURITY EVENT:', event);
  }

  getEvents(level?: SecurityEventLevel): SecurityEvent[] {
    if (level) {
      return this.events.filter(event => event.level === level);
    }
    return [...this.events];
  }

  getEventsByUser(userId: string): SecurityEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  clearEvents(): void {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();

// Convenience functions
export const logSecurityEvent = (
  event: string,
  description: string,
  level: SecurityEventLevel = 'low',
  userId?: string
): void => {
  securityLogger.logEvent(event, description, level, userId);
};

export const logAuthEvent = (event: string, userId?: string, level: SecurityEventLevel = 'low'): void => {
  securityLogger.logEvent(`auth_${event}`, `Authentication event: ${event}`, level, userId);
};

export const logDataEvent = (event: string, userId?: string, level: SecurityEventLevel = 'low'): void => {
  securityLogger.logEvent(`data_${event}`, `Data access event: ${event}`, level, userId);
};
