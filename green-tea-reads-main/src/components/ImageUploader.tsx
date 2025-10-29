
import React, { useState, useCallback, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (file: File | null) => void;
  externalPreview?: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, externalPreview }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
      onImageUpload(file);
    } else {
      setPreview(null);
      onImageUpload(null);
    }
  }, [onImageUpload, preview]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-300 mb-4">{title}</h2>
      <label
        htmlFor={`file-upload-${title.replace(/\s+/g, '-')}`}
        className="w-full aspect-square bg-primary/10 rounded-lg border-2 border-dashed border-primary/40 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/20 transition-all duration-300 relative overflow-hidden group"
      >
        {(externalPreview || preview) ? (
          <img src={externalPreview || preview || ''} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-primary/70">
            <Upload className="w-12 h-12 mx-auto" />
            <p className="mt-2">Click to upload an image</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white font-semibold">{(externalPreview || preview) ? 'Change Image' : 'Select Image'}</span>
        </div>
        <input
          id={`file-upload-${title.replace(/\s+/g, '-')}`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};
