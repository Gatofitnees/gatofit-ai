
import { ChatMessage, WebhookResponse } from './types';

export const processWebhookResponse = (responseText: string): ChatMessage => {
  let parsedResponse: WebhookResponse[] | any;
  
  try {
    parsedResponse = JSON.parse(responseText);
    console.log('🔍 [AI CHAT DEBUG] Respuesta parseada:', parsedResponse);
    console.log('🔍 [AI CHAT DEBUG] Tipo de respuesta:', typeof parsedResponse, Array.isArray(parsedResponse) ? 'Array' : 'Object');
  } catch (parseError) {
    console.error('❌ [AI CHAT ERROR] Error parseando JSON:', parseError);
    console.log('🔍 [AI CHAT DEBUG] Intentando usar respuesta como texto plano');
    
    // Fallback to treating as plain text
    return {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: responseText || 'Lo siento, no pude procesar tu mensaje.',
      timestamp: new Date(),
    };
  }

  // Handle new JSON format (array)
  if (Array.isArray(parsedResponse)) {
    console.log('🔍 [AI CHAT DEBUG] Procesando respuesta como array, longitud:', parsedResponse.length);
    
    if (parsedResponse.length === 0) {
      console.error('❌ [AI CHAT ERROR] Array de respuesta vacío');
      throw new Error('El webhook devolvió un array vacío');
    }

    const firstResponse = parsedResponse[0];
    console.log('🔍 [AI CHAT DEBUG] Primer elemento del array:', firstResponse);
    
    if (firstResponse && firstResponse.output) {
      console.log('🔍 [AI CHAT DEBUG] Output encontrado:', firstResponse.output);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: firstResponse.output.text || 'No se recibió texto en la respuesta.',
        timestamp: new Date(),
        buttons: firstResponse.output.button ? [firstResponse.output.button] : undefined,
      };
      
      console.log('✅ [AI CHAT SUCCESS] Mensaje AI creado:', aiMessage);
      return aiMessage;
    } else {
      console.error('❌ [AI CHAT ERROR] Estructura de respuesta inválida - falta output');
      throw new Error('Estructura de respuesta inválida - falta el campo output');
    }
  } else if (typeof parsedResponse === 'object' && parsedResponse !== null) {
    console.log('🔍 [AI CHAT DEBUG] Procesando respuesta como objeto');
    
    // Check for direct output field
    if (parsedResponse.output) {
      console.log('🔍 [AI CHAT DEBUG] Output directo encontrado:', parsedResponse.output);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: parsedResponse.output.text || 'No se recibió texto en la respuesta.',
        timestamp: new Date(),
        buttons: parsedResponse.output.button ? [parsedResponse.output.button] : undefined,
      };
      
      console.log('✅ [AI CHAT SUCCESS] Mensaje AI creado desde objeto:', aiMessage);
      return aiMessage;
    } else if (parsedResponse.text) {
      // Direct text field
      console.log('🔍 [AI CHAT DEBUG] Campo text directo encontrado:', parsedResponse.text);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: parsedResponse.text,
        timestamp: new Date(),
      };
      
      console.log('✅ [AI CHAT SUCCESS] Mensaje AI creado desde text directo:', aiMessage);
      return aiMessage;
    } else {
      console.error('❌ [AI CHAT ERROR] Objeto de respuesta sin campos reconocidos:', Object.keys(parsedResponse));
      // Fallback: try to use the whole object as text
      return {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: JSON.stringify(parsedResponse),
        timestamp: new Date(),
      };
    }
  } else {
    console.error('❌ [AI CHAT ERROR] Tipo de respuesta no reconocido:', typeof parsedResponse);
    // Fallback to string representation
    return {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: String(parsedResponse) || 'Lo siento, no pude procesar tu mensaje.',
      timestamp: new Date(),
    };
  }
};
