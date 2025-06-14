
import { logSecurityEvent } from './enhancedSecurityValidation';

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
      // Validate required environment variables
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
          enableWebhooks: environment === 'production', // Only enable in production
          enableAIChat: true,
          maxFileSize: 5 * 1024 * 1024, // 5MB
          allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        },
        security: {
          enforceHttps: environment === 'production',
          enableRateLimiting: true,
          enableSecurityHeaders: true,
          sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
        }
      };

      this.initialized = true;
      logSecurityEvent('config_initialized', `Environment: ${environment}`, 'low');
      
      return this.config;
    } catch (error: any) {
      logSecurityEvent('config_initialization_failed', error.message, 'high');
      throw new Error(`Configuration initialization failed: ${error.message}`);
    }
  }

  private getSecureWebhookUrl(): string | undefined {
    // In a real application, this should come from secure environment variables
    // For now, we'll return undefined to disable webhooks until properly configured
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
      logSecurityEvent('webhook_url_not_configured', 'Webhooks disabled', 'low');
      return undefined;
    }

    if (!webhookUrl.startsWith('https://')) {
      logSecurityEvent('webhook_url_insecure', 'Non-HTTPS webhook URL rejected', 'high');
      return undefined;
    }

    return webhookUrl;
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
          logSecurityEvent('config_validation_warning', 'HTTPS not enforced in production', 'medium');
        }
        
        if (!config.security.enableSecurityHeaders) {
          logSecurityEvent('config_validation_warning', 'Security headers disabled in production', 'medium');
        }
      }
      
      return true;
    } catch (error: any) {
      logSecurityEvent('config_validation_failed', error.message, 'high');
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
