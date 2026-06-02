import React, { useState, useRef } from "react";
import { UploadCloud, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ReferenceImage } from "../types";

interface ImageUploaderProps {
  images: ReferenceImage[];
  onImagesChange: (images: ReferenceImage[]) => void;
  isLoading: boolean;
}

export default function ImageUploader({ images, onImagesChange, isLoading }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList) => {
    setErrorMsg(null);
    const validImages: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Only image formats are accepted in reference view.");
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg("Selected files must be small (under 8MB each).");
        continue;
      }
      validImages.push(file);
    }

    if (validImages.length === 0) return;

    validImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          const newImg: ReferenceImage = {
            id: crypto.randomUUID(),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            type: file.type,
            data: e.target.result,
          };
          onImagesChange([...images, newImg]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const triggerFileInput = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Target Area - Supports Drag and Drop */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileInput}
        className={`w-full relative h-44 border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center transition-all duration-200 select-none ${
          isDragging
            ? "border-white bg-white/15 scale-[0.98] shadow-lg"
            : "border-white/20 hover:border-white/45 bg-white/5 hover:bg-white/10"
        } ${isLoading ? "pointer-events-none opacity-40" : ""}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          multiple
          accept="image/*"
          className="hidden"
        />

        <div className="text-center p-6 space-y-1">
          <div className="inline-flex p-2.5 rounded-full bg-white/10 text-white mb-1.5 shadow-sm">
            <UploadCloud className="w-5 h-5 text-white animate-pulse" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
            Import Reference Images
          </h3>
          <p className="text-[11px] text-white/60 font-sans leading-relaxed">
            Drag & drop files or click to load models
          </p>
          <p className="text-[9px] text-white/40 font-mono">
            PNG, JPG, WEBP • Max 8MB
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="text-xs bg-red-500/20 text-red-100 border border-red-500/30 rounded-xl p-3 font-sans">
          {errorMsg}
        </div>
      )}

      {/* Previews / Selected List */}
      <AnimatePresence>
        {images.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] font-sans">
                Active Source Models ({images.length})
              </h4>
              <button
                onClick={() => onImagesChange([])}
                className="text-[10px] text-white/60 hover:text-[#FF5D00] transition-colors font-sans font-bold uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="group relative rounded-xl border border-white/15 bg-white/5 backdrop-blur-md p-1.5 flex flex-col"
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/20 border border-white/5">
                    <img
                      src={img.data}
                      alt={img.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Quick delete overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(img.id);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-[#FF5D00] transition-all shadow-md cursor-pointer"
                      title="Remove physical reference"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="px-1 py-1 mt-1 text-left">
                    <p className="text-[10px] font-bold text-white truncate font-sans" title={img.name}>
                      {img.name.toUpperCase()}
                    </p>
                    <p className="text-[9px] text-white/50 font-mono mt-0.5">
                      {img.size}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
