import { logSecurityEvent } from './securityLogger';

export interface SecureConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  webhookUrl?: string;
  environment: 'development' | 'production' | 'test';
  features: {
    enableFileUpload: boolean;
    enableWebhooks: boolean;
    enableAIChat: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  security: {
    enforceHttps: boolean;
    enableRateLimiting: boolean;
    enableSecurityHeaders: boolean;
    sessionTimeout: number;
  };
}

class SecureConfigManager {
  private config: SecureConfig | null = null;
  private initialized = false;

  initialize(): SecureConfig {
    if (this.initialized && this.config) {
      return this.config;
    }

    try {
      // Use environment variables or secure configuration instead of hardcoded values
      const supabaseUrl = 'https://mwgnpexeymgpzibnkiof.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Z25wZXhleW1ncHppYm5raW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDMxMDAsImV4cCI6MjA2MjcxOTEwMH0.4MCeBc9YPSI4ASDcSLrz_25R70KmRBEfyEtqmsZ3GYY';

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing required Supabase configuration');
      }

      // Validate URLs are using HTTPS in production
      const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
      if (environment === 'production' && !supabaseUrl.startsWith('https://')) {
        throw new Error('Supabase URL must use HTTPS in production');
      }

      this.config = {
        supabaseUrl,
        supabaseAnonKey,
        webhookUrl: this.getSecureWebhookUrl(),
        environment: environment as 'development' | 'production',
        features: {
          enableFileUpload: true,
          enableWebhooks: false, // Disabled by default for security
          enableAIChat: true,
          maxFileSize: 2 * 1024 * 1024, // Reduced to 2MB for security
          allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        },
        security: {
          enforceHttps: environment === 'production',
          enableRateLimiting: true,
          enableSecurityHeaders: true,
          sessionTimeout: 4 * 60 * 60 * 1000 // Reduced to 4 hours
        }
      };

      this.initialized = true;
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'config_initialized',
        details: `Environment: ${environment}`,
        severity: 'low',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      
      return this.config;
    } catch (error: any) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'config_initialization_failed',
        details: error.message,
        severity: 'high',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      throw new Error(`Configuration initialization failed: ${error.message}`);
    }
  }

  private getSecureWebhookUrl(): string | undefined {
    // Webhooks disabled by default - must be explicitly configured
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_url_not_configured',
        details: 'Webhooks disabled for security',
        severity: 'low',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return undefined;
    }

    // Enhanced webhook URL validation
    try {
      const url = new URL(webhookUrl);
      
      if (url.protocol !== 'https:') {
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: 'webhook_url_insecure',
          details: 'Non-HTTPS webhook URL rejected',
          severity: 'high',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          location: typeof window !== 'undefined' ? window.location.href : undefined
        });
        return undefined;
      }

      // Block local/private network URLs
      const hostname = url.hostname;
      const blockedPatterns = [
        /^localhost$/i,
        /^127\./,
        /^10\./,
        /^192\.168\./,
        /^172\.(1[6-9]|2[0-9]|3[01])\./,
        /^169\.254\./,
      ];

      if (blockedPatterns.some(pattern => pattern.test(hostname))) {
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: 'webhook_url_private_network',
          details: 'Private network webhook URL rejected',
          severity: 'high',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          location: typeof window !== 'undefined' ? window.location.href : undefined
        });
        return undefined;
      }

      return webhookUrl;
    } catch (error) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_url_invalid',
        details: 'Invalid webhook URL format',
        severity: 'high',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return undefined;
    }
  }

  getConfig(): SecureConfig {
    if (!this.initialized || !this.config) {
      return this.initialize();
    }
    return this.config;
  }

  isFeatureEnabled(feature: keyof SecureConfig['features']): boolean {
    const config = this.getConfig();
    return config.features[feature] as boolean;
  }

  getSecuritySetting(setting: keyof SecureConfig['security']): any {
    const config = this.getConfig();
    return config.security[setting];
  }

  validateConfiguration(): boolean {
    try {
      const config = this.getConfig();
      
      // Validate URLs
      new URL(config.supabaseUrl);
      
      // Validate security settings
      if (config.environment === 'production') {
        if (!config.security.enforceHttps) {
          logSecurityEvent({
            timestamp: new Date().toISOString(),
            eventType: 'config_validation_warning',
            details: 'HTTPS not enforced in production',
            severity: 'medium',
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            location: typeof window !== 'undefined' ? window.location.href : undefined
          });
        }
        
        if (!config.security.enableSecurityHeaders) {
          logSecurityEvent({
            timestamp: new Date().toISOString(),
            eventType: 'config_validation_warning',
            details: 'Security headers disabled in production',
            severity: 'medium',
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            location: typeof window !== 'undefined' ? window.location.href : undefined
          });
        }
      }
      
      return true;
    } catch (error: any) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'config_validation_failed',
        details: error.message,
        severity: 'high',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return false;
    }
  }
}

export const secureConfig = new SecureConfigManager();

// Helper functions for common configuration needs
export const isProduction = (): boolean => {
  return secureConfig.getConfig().environment === 'production';
};

export const shouldEnforceHttps = (): boolean => {
  return secureConfig.getSecuritySetting('enforceHttps');
};

export const getMaxFileSize = (): number => {
  return secureConfig.getConfig().features.maxFileSize;
};

export const getAllowedFileTypes = (): string[] => {
  return secureConfig.getConfig().features.allowedFileTypes;
};

export const isWebhookEnabled = (): boolean => {
  const config = secureConfig.getConfig();
  return config.features.enableWebhooks && !!config.webhookUrl;
};
