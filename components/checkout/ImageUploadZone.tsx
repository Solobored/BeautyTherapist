'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface UploadedImage {
  url: string;
  publicId: string;
  position: number;
  preview?: string;
}

interface ImageUploadZoneProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  initialImages?: UploadedImage[];
}

export function ImageUploadZone({
  onImagesChange,
  maxImages = 8,
  initialImages = [],
}: ImageUploadZoneProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFiles = useCallback(
    async (files: FileList) => {
      if (images.length >= maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const filesToProcess = Array.from(files).filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(`${file.name} is not a supported image format`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          return false;
        }
        return true;
      });

      if (filesToProcess.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        for (const file of filesToProcess) {
          if (images.length >= maxImages) {
            toast.error(`Reached maximum of ${maxImages} images`);
            break;
          }

          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
          }

          const data = await response.json();

          const newImage: UploadedImage = {
            url: data.url,
            publicId: data.publicId,
            position: images.length,
          };

          const updatedImages = [...images, newImage];
          setImages(updatedImages);
          onImagesChange(updatedImages);
          toast.success(`${file.name} uploaded successfully`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [images, maxImages, onImagesChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    handleDrag(e);
    setDragActive(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      position: i,
    }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
    toast.success('Image removed');
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];
    updatedImages.forEach((img, i) => (img.position = i));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={loading}
            className="hidden"
            id="image-input"
          />

          <label
            htmlFor="image-input"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            {loading ? (
              <>
                <Spinner className="h-8 w-8 mb-2" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop images here, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or WebP up to 5MB each
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max {maxImages} images
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Uploaded Images ({images.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.publicId} className="relative group">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Message */}
      {images.length === 0 && !error && (
        <p className="text-sm text-red-500">At least 1 image is required</p>
      )}
    </div>
  );
}
