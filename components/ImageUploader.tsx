import React, { useCallback, useState } from 'react';
import { UploadIcon } from './IconComponents';

interface ImageUploaderProps {
  id: string;
  onImagesUpload: (files: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, onImagesUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (files: FileList | null) => {
    setError(null);
    if (files && files.length > 0) {
      const imageFiles: File[] = [];
      let nonImageFile = false;
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          imageFiles.push(file);
        } else {
          nonImageFile = true;
        }
      }
      
      if (imageFiles.length > 0) {
        onImagesUpload(imageFiles);
      }
      
      if (nonImageFile) {
        setError('Some files were not valid images and were ignored.');
      }
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [onImagesUpload]);

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
          isDragging ? 'border-indigo-400 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
        <p className="text-gray-400 text-center">
          <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">Upload 2 or more images (PNG, JPG, etc.)</p>
        <input
          id={id}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </label>
      {error && <p className="text-red-400 mt-2 text-sm text-center">{error}</p>}
    </div>
  );
};