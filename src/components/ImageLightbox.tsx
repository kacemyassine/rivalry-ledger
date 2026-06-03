import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, ImageOff, Loader2 } from 'lucide-react';
import { AuthService } from '@/lib/authService';
import { useGitHubData } from '@/hooks/useGitHubData';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  onUpload?: (path: string) => void;
  uploadPath?: string;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

async function convertToWebp(file: File): Promise<string> {
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

export function ImageLightbox({ src, alt, onClose, onUpload, uploadPath }: ImageLightboxProps) {
  const isAdmin = AuthService.isAuthenticated();
  const { uploadImage } = useGitHubData();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const navbar = document.querySelector('[data-navbar]') as HTMLElement;
    if (navbar) navbar.style.display = 'none';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      if (navbar) navbar.style.display = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await convertToWebp(file);
      const filename = `${alt.toLowerCase().replace(/\s+/g, '-')}.webp`;
      const fullPath = uploadPath ? `${uploadPath}/${filename}` : `images/${filename}`;
      const path = await uploadImage(base64, fullPath);
      if (path && onUpload) onUpload(path);
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm min-h-[100dvh]"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </button>

      {src ? (
        <img
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-6 text-white/60 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <ImageOff className="w-20 h-20 opacity-30" />
          <div className="text-center">
            <p className="text-2xl font-semibold text-white/80">404</p>
            <p className="text-base mt-1">Looks like this image is missing or doesn't exist yet.</p>
          </div>
          {isAdmin && uploadPath && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Add Image</>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}