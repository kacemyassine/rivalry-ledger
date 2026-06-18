const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export async function convertToWebp(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      let quality = 0.9;
      let result = '';

      const tryEncode = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        result = canvas.toDataURL('image/webp', quality);
        const sizeBytes = Math.ceil((result.length * 3) / 4);
        if (sizeBytes > MAX_SIZE_BYTES) {
          if (quality > 0.3) {
            quality -= 0.1;
          } else {
            width = Math.floor(width * 0.8);
            height = Math.floor(height * 0.8);
            quality = 0.9;
          }
          tryEncode();
        }
      };

      tryEncode();
      URL.revokeObjectURL(url);
      resolve(result);
    };
    img.src = url;
  });
}