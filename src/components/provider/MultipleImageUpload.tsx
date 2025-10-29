'use client';

import { useRef, useState } from 'react';

interface MultipleImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  label?: string;
  className?: string;
  maxFiles?: number;
}

export default function MultipleImageUpload({
  onUpload,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  label = 'Upload Images',
  className = '',
  maxFiles = 10,
}: MultipleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const validateFiles = (files: File[]): string | null => {
    // Check number of files
    if (files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    // Check file types
    const invalidTypes = files.filter(file => !acceptedTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      return `Invalid file types. Allowed types: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }

    // Check file sizes
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      return `Some files are too large. Maximum size: ${maxSizeMB}MB per file`;
    }

    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate
    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress({});

    try {
      await onUpload(files);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
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
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress({});

    // Simulate upload progress for each file
    files.forEach((file, index) => {
      const fileId = `${file.name}-${index}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId] || 0;
          if (current >= 100) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [fileId]: current + 10 };
        });
      }, 100);
    });

    // Upload files
    onUpload(files).then(() => {
      setError(null);
      setUploadProgress({});
    }).catch((err: any) => {
      setError(err.message || 'Failed to upload images');
      setUploadProgress({});
    }).finally(() => {
      setIsUploading(false);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const totalProgress = Object.values(uploadProgress).length > 0 
    ? Object.values(uploadProgress).reduce((sum, progress) => sum + progress, 0) / Object.values(uploadProgress).length
    : 0;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
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
          multiple
        />

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
            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop multiple images
          </div>
          <div className="text-xs text-gray-500">
            {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeMB}MB each
          </div>
          <div className="text-xs text-gray-500">
            Maximum {maxFiles} files
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-600">
              Uploading images... {Math.round(totalProgress)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="text-xs text-gray-500">
                {fileId.split('-')[0]}... {progress}%
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}
