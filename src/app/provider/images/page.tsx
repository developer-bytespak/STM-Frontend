'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { providerApi, ProviderImages } from '@/api/provider';
import ImageUpload from '@/components/provider/ImageUpload';
import MultipleImageUpload from '@/components/provider/MultipleImageUpload';
import ServiceImageViewer from '@/components/gallery/ServiceImageViewer';
import { ServiceImage } from '@/types/homepage';

export default function ProviderImagesPage() {
  const router = useRouter();
  const [images, setImages] = useState<ProviderImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{
    logo: boolean;
    banner: boolean;
    gallery: boolean;
  }>({
    logo: false,
    banner: false,
    gallery: false,
  });
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<ServiceImage[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      console.log('Fetching images...');
      const data = await providerApi.getImages();
      console.log('Images fetched:', data);
      setImages(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching images:', err);
      setError(err.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploading({ ...uploading, logo: true });
    setError(null);
    try {
      console.log('Uploading logo...');
      const result = await providerApi.uploadLogo(file);
      console.log('Logo upload result:', result);
      setImages((prev) => (prev ? { ...prev, logoUrl: result.logoUrl } : null));
      setSuccess('Logo uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Logo upload error:', err);
      throw err;
    } finally {
      setUploading({ ...uploading, logo: false });
    }
  };

  const handleBannerUpload = async (file: File) => {
    setUploading({ ...uploading, banner: true });
    setError(null);
    try {
      console.log('Uploading banner...');
      const result = await providerApi.uploadBanner(file);
      console.log('Banner upload result:', result);
      setImages((prev) => (prev ? { ...prev, bannerUrl: result.bannerUrl } : null));
      setSuccess('Banner uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Banner upload error:', err);
      throw err;
    } finally {
      setUploading({ ...uploading, banner: false });
    }
  };

  const handleGalleryUpload = async (file: File) => {
    setUploading({ ...uploading, gallery: true });
    setError(null);
    try {
      console.log('Uploading service image...');
      const result = await providerApi.uploadGalleryImage(file);
      console.log('Service image upload result:', result);
      setImages((prev) =>
        prev
          ? {
              ...prev,
              galleryImages: [...prev.galleryImages, result.image],
            }
          : null
      );
      setSuccess('Service image uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Service image upload error:', err);
      throw err;
    } finally {
      setUploading({ ...uploading, gallery: false });
    }
  };

  const handleMultipleGalleryUpload = async (files: File[]) => {
    setUploading({ ...uploading, gallery: true });
    setError(null);
    try {
      console.log('Uploading multiple service images...', files.length);
      
      // Upload files sequentially to avoid overwhelming the server
      const uploadPromises = files.map(file => providerApi.uploadGalleryImage(file));
      const results = await Promise.all(uploadPromises);
      
      console.log('Multiple service images upload results:', results);
      
      setImages((prev) =>
        prev
          ? {
              ...prev,
              galleryImages: [...prev.galleryImages, ...results.map(result => result.image)],
            }
          : null
      );
      
      setSuccess(`${files.length} service images uploaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Multiple service images upload error:', err);
      throw err;
    } finally {
      setUploading({ ...uploading, gallery: false });
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setError(null);
    try {
      await providerApi.deleteGalleryImage(imageId);
      setImages((prev) =>
        prev
          ? {
              ...prev,
              galleryImages: prev.galleryImages.filter((img) => img.id !== imageId),
            }
          : null
      );
      setSuccess('Image deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  };

  const openImageViewer = (imageType: 'logo' | 'banner' | 'gallery', index?: number) => {
    if (!images) return;

    let imagesToShow: ServiceImage[] = [];
    let startIndex = 0;

    if (imageType === 'logo' && images.logoUrl) {
      imagesToShow = [{
        id: 'logo',
        url: images.logoUrl,
        caption: 'Logo',
        order: 0
      }];
    } else if (imageType === 'banner' && images.bannerUrl) {
      imagesToShow = [{
        id: 'banner',
        url: images.bannerUrl,
        caption: 'Banner',
        order: 0
      }];
    } else if (imageType === 'gallery' && images.galleryImages.length > 0) {
      imagesToShow = images.galleryImages.map((img, idx) => ({
        id: img.id,
        url: img.url,
        caption: img.caption || `Gallery Image ${idx + 1}`,
        order: img.order
      }));
      startIndex = index || 0;
    }

    if (imagesToShow.length > 0) {
      setViewerImages(imagesToShow);
      setViewerIndex(startIndex);
      setShowImageViewer(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-16 mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>

          {/* Logo Upload Section Skeleton */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-red-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-4"></div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>

          {/* Banner Upload Section Skeleton */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-red-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-4"></div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>

          {/* Service Images Section Skeleton */}
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-4"></div>
            
            {/* Multiple Upload Button Skeleton */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-40 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-56 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </div>

            {/* Gallery Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="relative">
                  <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-300 rounded-b-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Manage Images</h1>
          <p className="text-gray-600 mt-2">Upload your logo, banner, and service images</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Logo</h2>
              {!images?.logoUrl && (
                <span className="text-sm text-red-600 font-medium">Required</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your logo will be displayed on provider cards and your detail page. Recommended size: 200x200px (max 2MB)
            </p>
            <ImageUpload
              onUpload={handleLogoUpload}
              currentImageUrl={images?.logoUrl || null}
              maxSizeMB={2}
              label="Upload Logo"
              required={true}
              onImageClick={() => openImageViewer('logo')}
              aspectRatio="square"
              maxHeight="12rem"
            />
          </div>

          {/* Banner Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Banner Image</h2>
              {!images?.bannerUrl && (
                <span className="text-sm text-red-600 font-medium">Required</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Main image displayed on provider cards and at the top of your detail page. Recommended size: 800x400px (max 3MB)
            </p>
            <ImageUpload
              onUpload={handleBannerUpload}
              currentImageUrl={images?.bannerUrl || null}
              maxSizeMB={3}
              label="Upload Banner"
              required={true}
              onImageClick={() => openImageViewer('banner')}
              aspectRatio="banner"
              maxHeight="12rem"
            />
          </div>

          {/* Service Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Images</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add multiple images to showcase your work. These will be displayed on your detail page. Recommended size: 1200x800px (max 5MB per image)
            </p>

            <div className="mb-6">
              <MultipleImageUpload
                onUpload={handleMultipleGalleryUpload}
                maxSizeMB={5}
                label="Add Service Images"
                maxFiles={10}
              />
            </div>

            {images?.galleryImages && images.galleryImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.galleryImages
                  .sort((a, b) => a.order - b.order)
                  .map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.caption || 'Service image'}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openImageViewer('gallery', index)}
                      />
                      <button
                        onClick={() => handleDeleteGalleryImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Delete image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg text-xs">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {(!images?.galleryImages || images.galleryImages.length === 0) && (
              <div className="text-center text-gray-500 py-8">
                <p>No service images yet. Upload images to showcase your work!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Image Viewer */}
      {showImageViewer && (
        <ServiceImageViewer
          images={viewerImages}
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          initialIndex={viewerIndex}
        />
      )}
    </div>
  );
}

