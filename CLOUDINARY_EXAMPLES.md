/\*\*

- Ejemplos de uso de Cloudinary en componentes
- Copia estas funciones en tus componentes para obtener URLs optimizadas
  \*/

// Archivo: components/product-card.tsx
// Ejemplo cómo usar las URLs optimizadas

import { getProductCardImageUrl } from '@/lib/cloudinary'

export function ProductCardExample({ product }) {
// URL automáticamente optimizada para tarjetas
// - 500x500px
// - WebP automático
// - Comprimida
const imageUrl = getProductCardImageUrl(product.images[0])

return (
<div>
<img src={imageUrl} alt={product.name} />
</div>
)
}

// ============================================================================

// Archivo: components/home/hero-section.tsx
// Ejemplo con imágenes hero/banner

import { getHeroImageUrl } from '@/lib/cloudinary'

export function HeroSection({ banner }) {
// URL optimizada para banners
// - 1200x600px
// - Heavily compressed
// - Auto gravity (sujeto importante en centro)
const imageUrl = getHeroImageUrl(banner.publicId)

return (
<div style={{ backgroundImage: `url(${imageUrl})` }}>
{/_ contenido _/}
</div>
)
}

// ============================================================================

// Archivo: components/product-gallery.tsx
// Ejemplo con imágenes responsivas

import { getResponsiveImageUrls } from '@/lib/cloudinary'

export function ProductGallery({ productId, image }) {
// Obtiene URLs en múltiples tamaños
const urls = getResponsiveImageUrls(image.publicId, {
quality: 85,
crop: 'fill',
})

return (
<img
src={urls.medium}
srcSet={`         ${urls.small} 400w,
        ${urls.medium} 800w,
        ${urls.large} 1200w
      `}
sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
alt="Producto"
/>
)
}

// ============================================================================

// Archivo: app/seller/products/page.tsx
// Ejemplo con thumbnails en listados

import { getThumbnailUrl } from '@/lib/cloudinary'

export function ProductsList({ products }) {
return (
<div className="grid grid-cols-4 gap-4">
{products.map((product) => (
<div key={product.id}>
{/_ URL muy pequeña, fuertemente comprimida _/}
<img 
            src={getThumbnailUrl(product.images[0])} 
            alt={product.name}
            className="w-full aspect-square object-cover"
          />
</div>
))}
</div>
)
}

// ============================================================================

// Archivo: components/checkout/cart-item.tsx
// Ejemplo con URL personalizada

import { getCloudinaryUrl } from '@/lib/cloudinary'

export function CartItem({ item }) {
// URL completamente personalizada
const imageUrl = getCloudinaryUrl(item.publicId, {
width: 150,
height: 150,
crop: 'fill',
gravity: 'auto',
quality: 75, // Carrito no necesita alta calidad
})

return (
<div className="flex gap-4">
<img src={imageUrl} alt={item.name} className="w-20 h-20 object-cover" />
<div>
<p>{item.name}</p>
<p>${item.price}</p>
</div>
</div>
)
}

// ============================================================================

// Archivo: app/blog/[slug]/page.tsx
// Ejemplo con featured image optimizada

import { getCloudinaryUrl } from '@/lib/cloudinary'

export function BlogPost({ post }) {
// Imagen destacada del blog
const featuredImage = getCloudinaryUrl(post.image, {
width: 1000,
height: 600,
crop: 'fill',
gravity: 'auto',
quality: 85,
format: 'auto',
})

return (
<article>
<img src={featuredImage} alt={post.title} className="w-full h-96 object-cover" />
<h1>{post.title}</h1>
{/_ resto del post _/}
</article>
)
}

// ============================================================================

// Archivo: lib/utils.ts
// Ejemplo de función helper para galería

import { getCloudinaryUrl } from '@/lib/cloudinary'

/\*\*

- Genera srcSet automático para responsive images
  \*/
  export function generateSrcSet(publicId: string, breakpoints = [400, 800, 1200]) {
  return breakpoints
  .map(width => `${getCloudinaryUrl(publicId, { width })} ${width}w`)
  .join(', ')
  }

// Uso:
// <img src={getCloudinaryUrl(id, { width: 800 })} srcSet={generateSrcSet(id)} />

// ============================================================================

// Archivo: hooks/use-image-url.ts
// Ejemplo de custom hook para URLs

import { getCloudinaryUrl } from '@/lib/cloudinary'

export function useImageUrl(publicId: string, options?: {
width?: number
height?: number
crop?: string
quality?: number
}) {
return getCloudinaryUrl(publicId, options)
}

// Uso en componentes:
// const imageUrl = useImageUrl(product.image.publicId, { width: 500 })

// ============================================================================

// Archivo: next.config.js
// Agregar dominio de Cloudinary al optimizador de imágenes (opcional)

// Si usas next/image:
module.exports = {
images: {
remotePatterns: [
{
protocol: 'https',
hostname: 'res.cloudinary.com',
pathname: '/**',
},
],
},
}

// ============================================================================

// Archivo: components/seller/seller-product-form.tsx
// Ejemplo completo: Cómo integrar ImageUploadZone

import { ImageUploadZone } from '@/components/checkout/ImageUploadZone'

export function SellerProductForm() {
const [uploadedImages, setUploadedImages] = useState([])

const handleImagesChange = (images) => {
// images contiene:
// - url: URL de Cloudinary
// - publicId: ID en Cloudinary
// - compressedSize: Tamaño después de compresión
// - originalSize: Tamaño antes de compresión
setUploadedImages(images)
}

return (
<form>
<ImageUploadZone 
        onImagesChange={handleImagesChange}
        maxImages={8}
        webpOnly={false}
      />

      {/* mostrar imágenes subidas */}
      {uploadedImages.map(img => (
        <div key={img.publicId}>
          <img src={img.url} alt="Producto" />
          <p>URL: {img.url}</p>
          <p>Comprimida: {img.compressedSize} bytes</p>
        </div>
      ))}
    </form>

)
}

// ============================================================================

// PATRONES DE OPTIMIZACIÓN RECOMENDADOS

// 1. PARA PRODUCT CARDS (galerías, listados)
const cardUrl = getCloudinaryUrl(publicId, {
width: 400,
height: 400,
crop: 'fill',
quality: 80,
})

// 2. PARA HERO/BANNERS
const heroUrl = getCloudinaryUrl(publicId, {
width: 1200,
height: 600,
crop: 'fill',
gravity: 'auto',
quality: 85,
})

// 3. PARA THUMBNAILS (listas, carrito)
const thumbUrl = getCloudinaryUrl(publicId, {
width: 150,
height: 150,
crop: 'fill',
quality: 70,
})

// 4. PARA PREVISUALIZACIONES
const previewUrl = getCloudinaryUrl(publicId, {
width: 200,
height: 200,
crop: 'fill',
quality: 75,
})

// 5. PARA FULL WIDTH DISPLAY
const fullUrl = getCloudinaryUrl(publicId, {
width: 1920,
height: 1080,
crop: 'fill',
quality: 85,
})
