
// Detectar si es HEIC por nombre de archivo o tipo MIME
export const isHeicFormat = (file: Blob): boolean => {
  if (file instanceof File) {
    return file.name.toLowerCase().endsWith('.heic') || 
           file.name.toLowerCase().endsWith('.heif') ||
           file.type === 'image/heic' ||
           file.type === 'image/heif';
  }
  return file.type === 'image/heic' || file.type === 'image/heif';
};

export const getImageMimeType = (file: Blob): string => {
  if (file.type) return file.type;
  return 'image/jpeg'; // fallback
};

export const getImageExtension = (file: Blob): string => {
  const mimeType = getImageMimeType(file);
  switch (mimeType) {
    case 'image/png': return 'png';
    case 'image/jpeg': return 'jpg';
    case 'image/webp': return 'webp';
    case 'image/gif': return 'gif';
    case 'image/bmp': return 'bmp';
    default: return 'jpg';
  }
};

export const convertImageToJpg = async (file: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Si es un File y es HEIC, advertir al usuario
    if (isHeicFormat(file)) {
      console.warn('⚠️ HEIC format detected - may have conversion issues');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Timeout para evitar cuelgues
    const timeout = setTimeout(() => {
      console.error('❌ Image conversion timeout');
      reject(new Error('Timeout al convertir imagen. Intenta con otro formato.'));
    }, 10000);
    
    let objectUrl: string | null = null;
    
    img.onload = () => {
      clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      
      // Validar dimensiones
      if (img.width === 0 || img.height === 0) {
        console.error('❌ Invalid image dimensions');
        reject(new Error('Imagen inválida'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Fill with white background (for transparency)
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      canvas.toBlob((blob) => {
        if (blob && blob.size > 0) {
          // Validar que el blob no esté vacío
          const validBlob = new Blob([blob], { type: 'image/jpeg' });
          console.log('✅ Image converted successfully:', validBlob.size, 'bytes');
          resolve(validBlob);
        } else {
          console.error('❌ Conversion produced empty blob');
          reject(new Error('Error al convertir imagen'));
        }
      }, 'image/jpeg', 0.9);
    };
    
    img.onerror = (error) => {
      clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      console.error('❌ Image load error:', error);
      
      // Para HEIC, dar un mensaje específico
      if (isHeicFormat(file)) {
        reject(new Error('Formato HEIC no soportado. Por favor, toma la foto desde la app o conviértela a JPG.'));
      } else {
        reject(new Error('Error al cargar imagen. Intenta con otro formato.'));
      }
    };
    
    objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
};
