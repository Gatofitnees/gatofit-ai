
import { supabase } from '@/integrations/supabase/client';
import { getImageExtension } from '@/utils/imageUtils';

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
    console.log('Uploading image to Supabase...', { 
      fileSize: file.size, 
      fileType: file.type || 'unknown'
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Use original file extension instead of forcing .jpg
    const extension = getImageExtension(file);
    const fileName = `${user.id}/${Date.now()}.${extension}`;
    
    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(fileName, file);

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('food-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded successfully to Supabase:', publicUrl);

    // Send to webhook and get analysis result
    const analysisResult = await sendToWebhookWithResponse(publicUrl, file);

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
      fileSize: file.size, 
      fileType: file.type || 'unknown'
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Use original file extension
    const extension = getImageExtension(file);
    const fileName = `${user.id}/${Date.now()}.${extension}`;
    
    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(fileName, file);

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
