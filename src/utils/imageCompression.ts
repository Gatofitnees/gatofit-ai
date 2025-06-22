
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export const compressImage = async (
  file: Blob, 
  options: CompressionOptions = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeKB = 1024
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Fill with white background for transparency
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          // Check if we need further compression based on size
          const sizeKB = blob.size / 1024;
          if (sizeKB > maxSizeKB && quality > 0.3) {
            // Recursively compress with lower quality
            const newQuality = Math.max(0.3, quality - 0.2);
            compressImage(blob, { ...options, quality: newQuality }).then(resolve);
          } else {
            resolve(blob);
          }
        } else {
          resolve(file); // Fallback to original if compression fails
        }
      }, 'image/jpeg', quality);
    };
    
    img.onerror = () => {
      resolve(file); // Fallback to original if loading fails
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const getFileSizeKB = (file: Blob): number => {
  return file.size / 1024;
};

export const shouldCompressForWebhook = (file: Blob): boolean => {
  return getFileSizeKB(file) > 500; // Comprimir si es mayor a 500KB (más agresivo)
};

export const compressForWebhook = async (file: Blob): Promise<Blob> => {
  console.log(`Compressing image for upload. Original size: ${getFileSizeKB(file).toFixed(2)}KB`);
  
  const compressed = await compressImage(file, {
    maxWidth: 1440,
    maxHeight: 1440,
    quality: 0.75,
    maxSizeKB: 400 // Más agresivo para ahorrar storage
  });
  
  console.log(`Image compressed. New size: ${getFileSizeKB(compressed).toFixed(2)}KB`);
  return compressed;
};
