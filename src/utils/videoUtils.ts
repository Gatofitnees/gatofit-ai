
/**
 * Extracts a single frame from a video file at a specific time point.
 *
 * @param videoFile The video file (from an <input type="file">).
 * @param seekTo The time in seconds to seek to for frame extraction (default: 0.5s).
 * @returns A Promise that resolves with a Blob of the extracted frame in JPEG format, or null if extraction fails.
 */
export const extractFrameFromVideo = (videoFile: File, seekTo = 0.5): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    // Create a video element in memory
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;

    // Create a canvas to draw the frame on
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return reject(new Error('Canvas 2D context is not available. This browser may not be supported.'));
    }

    // When video metadata is loaded, set canvas dimensions and seek
    video.addEventListener('loadedmetadata', () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = seekTo;
    });

    // When seeking is complete, draw the frame and create a blob
    video.addEventListener('seeked', () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          // Clean up the object URL to prevent memory leaks
          URL.revokeObjectURL(video.src);
          resolve(blob);
        },
        'image/jpeg',
        0.9 // Use high quality for the JPEG output
      );
    });

    // Handle any errors during video loading
    video.addEventListener('error', (e) => {
      console.error('Error loading video for frame extraction:', e);
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video file.'));
    });

    // Set the video source to an object URL created from the file
    video.src = URL.createObjectURL(videoFile);
  });
};
