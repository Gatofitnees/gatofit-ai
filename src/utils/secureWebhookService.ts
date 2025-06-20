
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './securityLogger';
import { securityConfig } from './secureConfig';

interface WebhookPayload {
  prompt: string;
  context?: any;
  userId?: string;
}

interface WebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class SecureWebhookService {
  private readonly baseUrl: string;
  private readonly timeout: number = 30000; // 30 seconds
  private readonly maxRetries: number = 3;

  constructor() {
    // Use environment variable or secure storage for webhook URL
    this.baseUrl = this.getSecureWebhookUrl();
  }

  private getSecureWebhookUrl(): string {
    // Try to get from environment variables first
    const envUrl = import.meta.env.VITE_WEBHOOK_URL;
    if (envUrl) {
      return envUrl;
    }

    // Fallback to Supabase edge function (more secure than hardcoded URL)
    const supabaseUrl = 'https://mwgnpexeymgpzibnkiof.supabase.co';
    return `${supabaseUrl}/functions/v1/analyze-food`;
  }

  private async validateWebhookResponse(response: any): Promise<boolean> {
    try {
      // Basic structure validation
      if (!response || typeof response !== 'object') {
        return false;
      }

      // Check for required fields based on your webhook's expected response
      if (response.error && typeof response.error !== 'string') {
        return false;
      }

      if (response.data && typeof response.data !== 'object') {
        return false;
      }

      return true;
    } catch (error) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_validation_error',
        details: error instanceof Error ? error.message : 'Unknown validation error',
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return false;
    }
  }

  private sanitizePayload(payload: WebhookPayload): WebhookPayload {
    return {
      prompt: typeof payload.prompt === 'string' ? payload.prompt.slice(0, 5000) : '',
      context: payload.context ? JSON.parse(JSON.stringify(payload.context)) : undefined,
      userId: payload.userId || undefined
    };
  }

  async sendSecureWebhook(payload: WebhookPayload, retryCount: number = 0): Promise<WebhookResponse> {
    try {
      // Sanitize payload
      const sanitizedPayload = this.sanitizePayload(payload);
      
      // Get current user for authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: 'webhook_unauthorized_attempt',
          details: 'No authenticated user',
          severity: 'high',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          location: typeof window !== 'undefined' ? window.location.href : undefined
        });
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Get session token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { success: false, error: 'Sesión inválida' };
      }

      // Make secure request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), securityConfig.urls.webhookTimeout);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'User-Agent': 'GatoFit-App/1.0'
        },
        body: JSON.stringify(sanitizedPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      const responseData = await response.json();

      // Validate response structure
      const isValid = await this.validateWebhookResponse(responseData);
      if (!isValid) {
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: 'webhook_invalid_response',
          details: 'Response validation failed',
          severity: 'medium',
          userId: user.id,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          location: typeof window !== 'undefined' ? window.location.href : undefined
        });
        return { success: false, error: 'Respuesta inválida del servidor' };
      }

      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_success',
        details: 'Webhook completed successfully',
        severity: 'low',
        userId: user.id,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });

      return { success: true, data: responseData };

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown webhook error';
      
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_error',
        details: errorMessage,
        severity: retryCount >= securityConfig.urls.maxRetries ? 'high' : 'medium',
        userId: payload.userId,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });

      // Retry logic for network errors
      if (retryCount < securityConfig.urls.maxRetries && (
        error.name === 'AbortError' || 
        error.message.includes('network') ||
        error.message.includes('timeout')
      )) {
        console.log(`Retrying webhook (attempt ${retryCount + 1}/${securityConfig.urls.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return this.sendSecureWebhook(payload, retryCount + 1);
      }

      return { 
        success: false, 
        error: retryCount >= securityConfig.urls.maxRetries ? 
          'Servicio temporalmente no disponible' : 
          'Error de conexión'
      };
    }
  }
}

export const secureWebhookService = new SecureWebhookService();
