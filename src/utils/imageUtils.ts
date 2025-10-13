
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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Fill with white background (for transparency)
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      canvas.toBlob((blob) => {
        if (blob && blob.type === 'image/jpeg') {
          console.log('✅ Image converted to JPG successfully:', blob.size, 'bytes');
          resolve(blob);
        } else {
          console.error('❌ Failed to convert to JPG, blob type:', blob?.type);
          // Create a new Blob with forced MIME type
          if (blob) {
            const fixedBlob = new Blob([blob], { type: 'image/jpeg' });
            console.log('🔧 Fixed blob MIME type to image/jpeg');
            resolve(fixedBlob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }
      }, 'image/jpeg', 0.9);
    };
    
    img.onerror = (error) => {
      console.error('❌ Image load error during conversion:', error);
      // Return original file with forced MIME type as fallback
      const fallbackBlob = new Blob([file], { type: 'image/jpeg' });
      console.log('🔧 Using fallback blob with forced MIME type');
      resolve(fallbackBlob);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
