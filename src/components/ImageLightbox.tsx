import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Upload, ImageOff, Loader2 } from "lucide-react";
import { AuthService } from "@/lib/authService";
import { useGitHubData } from "@/hooks/useGitHubData";
import { convertToWebp } from "@/lib/imageUtils";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  onUpload?: (path: string) => void;
  uploadPath?: string;
}

export function ImageLightbox({
  src,
  alt,
  onClose,
  onUpload,
  uploadPath,
}: ImageLightboxProps) {
  const isAdmin = AuthService.isAuthenticated();
  const { uploadImage } = useGitHubData();
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoadError(false);
  }, [src]);

  useEffect(() => {
    const navbar = document.querySelector("[data-navbar]") as HTMLElement;
    if (navbar) navbar.style.display = "none";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      if (navbar) navbar.style.display = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await convertToWebp(file);
      const filename = `${alt.toLowerCase().replace(/\s+/g, "-")}.webp`;
      const fullPath = uploadPath
        ? `${uploadPath}/${filename}`
        : `images/${filename}`;
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

      {src && !loadError ? (
        <img
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          onError={() => setLoadError(true)}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-6 text-white/60 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <ImageOff className="w-20 h-20 opacity-30" />
          <div className="text-center">
            <p className="text-2xl font-semibold text-white/80">404</p>
            <p className="text-base mt-1">
              Looks like this image is missing or doesn't exist yet.
            </p>
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
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Add Image
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}
