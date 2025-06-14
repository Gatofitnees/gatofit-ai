
import { UserData, WebhookResponse } from './types';

const WEBHOOK_URL = 'https://gaton8n.gatofit.com/webhook-test/5ad29227-88fb-46ab-bff9-c44cb4e1d957';

export const sendToWebhook = async (message: string, userData: UserData): Promise<any> => {
  const payload = {
    message: message.trim(),
    user_data: userData,
  };

  console.log('🔍 [AI CHAT DEBUG] Enviando petición al webhook:', payload);
  console.log('🔍 [AI CHAT DEBUG] URL del webhook:', WEBHOOK_URL);

  const requestStart = Date.now();
  
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const requestDuration = Date.now() - requestStart;
  console.log(`🔍 [AI CHAT DEBUG] Respuesta recibida en ${requestDuration}ms`);
  console.log('🔍 [AI CHAT DEBUG] Status de respuesta:', response.status);
  console.log('🔍 [AI CHAT DEBUG] Headers de respuesta:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    console.error('❌ [AI CHAT ERROR] HTTP error:', response.status, response.statusText);
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }

  // Check content type
  const contentType = response.headers.get('content-type');
  console.log('🔍 [AI CHAT DEBUG] Content-Type:', contentType);

  const responseText = await response.text();
  console.log('🔍 [AI CHAT DEBUG] Respuesta raw del webhook:', responseText);
  console.log('🔍 [AI CHAT DEBUG] Longitud de respuesta:', responseText.length);

  if (!responseText || responseText.trim() === '') {
    console.error('❌ [AI CHAT ERROR] Respuesta vacía del webhook');
    throw new Error('El webhook devolvió una respuesta vacía');
  }

  return responseText;
};
