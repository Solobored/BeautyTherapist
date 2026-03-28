/**
 * Cloudinary utility functions for optimized image handling
 * Automatically compresses, adapts format, and generates responsive images
 */

/**
 * Generates an optimized Cloudinary URL from a public ID with size-specific transformations
 */
export function getCloudinaryUrl(publicId: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
  crop?: string
  gravity?: string
}): string {
  const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`

  // Default optimizations: auto format, auto quality, and strip EXIF for size reduction
  const transformations = [
    'f_auto', // Auto format (WebP for modern browsers, JPEG fallback)
    'q_auto:eco', // Aggressive quality optimization (better compression)
    'dpr_auto', // Device pixel ratio optimization
  ]

  // Add custom transformations if provided
  if (options?.width || options?.height) {
    const crop = options?.crop || 'limit'
    const gravity = options?.gravity || 'auto'
    let sizeTransform = ''

    if (options.width && options.height) {
      sizeTransform = `c_${crop},g_${gravity},w_${options.width},h_${options.height}`
    } else if (options.width) {
      sizeTransform = `w_${options.width},c_limit`
    } else if (options.height) {
      sizeTransform = `h_${options.height},c_limit`
    }

    if (sizeTransform) {
      transformations.push(sizeTransform)
    }
  }

  // Custom quality if provided, otherwise use auto:eco
  if (options?.quality) {
    transformations[1] = `q_${Math.min(options.quality, 90)}` // Cap at 90 for optimal compression
  }

  // Custom format if provided
  if (options?.format) {
    transformations[0] = `f_${options.format}`
  }

  return `${baseUrl}/${transformations.join('/')}/${publicId}`
}

/**
 * Gets optimized URLs for different screen sizes (responsive images)
 */
export function getResponsiveImageUrls(publicId: string, options?: {
  formats?: string[]
  quality?: number
  crop?: string
  gravity?: string
}) {
  const sizes = {
    thumbnail: 200,
    small: 400,
    medium: 800,
    large: 1200,
    xlarge: 1600,
  }

  return {
    thumbnail: getCloudinaryUrl(publicId, { width: sizes.thumbnail, ...options }),
    small: getCloudinaryUrl(publicId, { width: sizes.small, ...options }),
    medium: getCloudinaryUrl(publicId, { width: sizes.medium, ...options }),
    large: getCloudinaryUrl(publicId, { width: sizes.large, ...options }),
    xlarge: getCloudinaryUrl(publicId, { width: sizes.xlarge, ...options }),
  }
}

/**
 * Gets a thumb preview URL (tiny, heavily compressed)
 */
export function getThumbnailUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 150,
    height: 150,
    crop: 'fill',
    quality: 70,
  })
}

/**
 * Gets a display URL optimized for product cards
 */
export function getProductCardImageUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 500,
    height: 500,
    crop: 'fill',
    gravity: 'auto',
    quality: 80,
  })
}

/**
 * Gets a hero/banner image URL
 */
export function getHeroImageUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 1200,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 85,
  })
}

/**
 * Estimate data saved using Cloudinary compression
 */
export function estimateCompressionSavings(originalSize: number, compressedSize?: number): {
  saved: number
  percentage: number
} {
  // If compressedSize not provided, estimate ~70% compression for JPEG to WebP
  const estimated = compressedSize || Math.round(originalSize * 0.3)
  return {
    saved: originalSize - estimated,
    percentage: Math.round(((originalSize - estimated) / originalSize) * 100),
  }
}
