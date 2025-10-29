'use client';

import { useRef, useState, useEffect } from 'react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  currentImageUrl?: string | null;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  label?: string;
  required?: boolean;
  className?: string;
  onImageClick?: () => void;
  aspectRatio?: 'square' | 'banner' | 'auto';
  maxHeight?: string;
}

export default function ImageUpload({
  onUpload,
  currentImageUrl,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  label = 'Upload Image',
  required = false,
  className = '',
  onImageClick,
  aspectRatio = 'auto',
  maxHeight = '12rem',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  // Update preview when currentImageUrl changes
  useEffect(() => {
    console.log('ImageUpload currentImageUrl changed:', currentImageUrl);
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      await onUpload(file);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      setPreview(currentImageUrl || null); // Revert preview on error
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Create preview and upload
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPreview(reader.result as string);
        setIsUploading(true);
        try {
          await onUpload(file);
          setError(null);
        } catch (err: any) {
          setError(err.message || 'Failed to upload image');
          setPreview(currentImageUrl || null);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative">
            <div 
              className={`
                mx-auto rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity
                ${aspectRatio === 'square' ? 'w-48 h-48' : ''}
                ${aspectRatio === 'banner' ? 'w-full h-48' : ''}
                ${aspectRatio === 'auto' ? 'max-w-full' : ''}
              `}
              style={{ maxHeight: aspectRatio === 'auto' ? maxHeight : 'auto' }}
            >
              <img
                src={preview}
                alt="Preview"
                className={`
                  w-full h-full object-cover
                  ${aspectRatio === 'square' ? 'object-cover' : 'object-cover'}
                  ${aspectRatio === 'banner' ? 'object-cover' : ''}
                  ${aspectRatio === 'auto' ? 'object-contain' : ''}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick?.();
                }}
              />
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-white text-sm">Uploading...</div>
              </div>
            )}
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Change Image
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-gray-500">
              {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeMB}MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}

