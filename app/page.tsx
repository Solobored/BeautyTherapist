import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { BrandsShowcase } from '@/components/home/brands-showcase'
import { Testimonials } from '@/components/home/testimonials'
import { BlogPreview } from '@/components/home/blog-preview'
import { VideosPreview } from '@/components/home/videos-preview'

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <VideosPreview />
        <FeaturedProducts />
        <BrandsShowcase />
        <Testimonials />
        <BlogPreview />
      </main>
      <Footer />
    </div>
  )
}
