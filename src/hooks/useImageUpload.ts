
import { supabase } from '@/integrations/supabase/client';
import { getImageExtension, convertImageToJpg, isHeicFormat } from '@/utils/imageUtils';
import { compressForWebhook, shouldCompressForWebhook } from '@/utils/imageCompression';

export interface CapturedFood {
  imageUrl: string;
  fileName: string;
  analysisResult?: any;
}

export const uploadImageWithAnalysis = async (
  file: Blob, 
  sendToWebhookWithResponse: (url: string, blob: Blob) => Promise<any>
): Promise<CapturedFood | null> => {
  try {
    console.log('Starting image upload and analysis...', { 
      originalSize: file.size, 
      fileType: file.type || 'unknown'
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // PASO 1: Convertir a JPG si es HEIC o no tiene tipo MIME válido
    let processedFile = file;
    if (isHeicFormat(file) || !file.type || !file.type.startsWith('image/')) {
      console.log('🔄 Converting image to JPG before upload...');
      processedFile = await convertImageToJpg(file);
      console.log('✅ Image converted to JPG:', {
        size: processedFile.size,
        type: processedFile.type
      });
    }

    // PASO 2: Comprimir imagen
    if (shouldCompressForWebhook(processedFile)) {
      console.log('Compressing image before upload...');
      processedFile = await compressForWebhook(processedFile);
      console.log(`Image compressed: ${file.size} -> ${processedFile.size} bytes`);
    }

    // PASO 3: Validar tipo MIME antes de subir
    console.log('📤 Preparing upload:', {
      size: processedFile.size,
      type: processedFile.type,
      hasValidMimeType: processedFile.type.startsWith('image/')
    });
    
    if (!processedFile.type || !processedFile.type.startsWith('image/')) {
      throw new Error(`Tipo de archivo inválido: ${processedFile.type || 'desconocido'}`);
    }

    // Usar extensión de la imagen comprimida
    const extension = getImageExtension(processedFile);
    const fileName = `${user.id}/${Date.now()}.${extension}`;
    
    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(fileName, processedFile);

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('food-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded successfully to Supabase:', publicUrl);

    // Enviar imagen comprimida al webhook
    const analysisResult = await sendToWebhookWithResponse(publicUrl, processedFile);

    if (!analysisResult) {
      console.log('Webhook analysis failed, returning null');
      return null;
    }

    return {
      imageUrl: publicUrl,
      fileName: data.path,
      analysisResult
    };
  } catch (err) {
    console.error('Error uploading image:', err);
    return null;
  }
};

export const uploadImage = async (file: Blob): Promise<CapturedFood | null> => {
  try {
    console.log('Uploading image to Supabase...', { 
      originalSize: file.size, 
      fileType: file.type || 'unknown'
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // PASO 1: Convertir a JPG si es HEIC o no tiene tipo MIME válido
    let processedFile = file;
    if (isHeicFormat(file) || !file.type || !file.type.startsWith('image/')) {
      console.log('🔄 Converting image to JPG before upload...');
      processedFile = await convertImageToJpg(file);
      console.log('✅ Image converted to JPG:', {
        size: processedFile.size,
        type: processedFile.type
      });
    }

    // PASO 2: Comprimir imagen
    if (shouldCompressForWebhook(processedFile)) {
      console.log('Compressing image before upload...');
      processedFile = await compressForWebhook(processedFile);
      console.log(`Image compressed: ${file.size} -> ${processedFile.size} bytes`);
    }

    // PASO 3: Validar tipo MIME antes de subir
    console.log('📤 Preparing upload:', {
      size: processedFile.size,
      type: processedFile.type,
      hasValidMimeType: processedFile.type.startsWith('image/')
    });
    
    if (!processedFile.type || !processedFile.type.startsWith('image/')) {
      throw new Error(`Tipo de archivo inválido: ${processedFile.type || 'desconocido'}`);
    }

    // Usar extensión de la imagen comprimida
    const extension = getImageExtension(processedFile);
    const fileName = `${user.id}/${Date.now()}.${extension}`;
    
    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(fileName, processedFile);

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('food-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded successfully to Supabase:', publicUrl);

    return {
      imageUrl: publicUrl,
      fileName: data.path
    };
  } catch (err) {
    console.error('Error uploading image:', err);
    return null;
  }
};
