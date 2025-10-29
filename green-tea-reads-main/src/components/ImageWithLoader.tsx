import React, { useState, useEffect } from 'react';

interface ImageWithLoaderProps {
  src?: string;
  alt: string;
}

export const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ src, alt }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    // Reset status when src changes
    setStatus('loading');

    if (!src) {
      setStatus('error');
      return;
    }

    const img = new Image();
    img.onload = () => {
      setStatus('loaded');
    };
    img.onerror = () => {
      // This will catch 404s, CORS issues, etc.
      setStatus('error');
    };
    img.src = src;

    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div className="w-full h-full bg-gray-700 relative">
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gray-600 animate-pulse"></div>
      )}

      {status === 'error' && (
        <div className="w-full h-full flex items-center justify-center text-gray-400 p-4 text-center">
           <p className="text-xs">Image for <br/><strong className="text-gray-300">{alt}</strong><br/> could not be loaded.</p>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        style={{ display: status === 'loaded' ? 'block' : 'none' }}
      />
    </div>
  );
};