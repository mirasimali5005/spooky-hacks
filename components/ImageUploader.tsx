import React, { useState, useRef, ChangeEvent } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (base64: string | null) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, disabled }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        onImageUpload(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleContainerClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-medium text-slate-300 mb-2">{title}</h3>
      <div 
        onClick={handleContainerClick}
        className={`w-full aspect-square rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400 bg-slate-900/50 transition-all duration-300
          ${!disabled ? 'cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50' : 'cursor-not-allowed opacity-60'}
          ${imagePreview ? 'border-solid' : ''}`
        }
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          aria-label={`Upload ${title}`}
        />
        {imagePreview ? (
          <img src={imagePreview} alt={`${title} preview`} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="text-center">
            <UploadIcon className="w-10 h-10 mx-auto mb-2" />
            <p>Click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};