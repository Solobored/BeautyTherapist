import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { MarketplaceCategoryRail } from '@/components/home/marketplace-category-rail'
import { Testimonials } from '@/components/home/testimonials'

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">
        <HeroSection />
        <MarketplaceCategoryRail />
        <FeaturedProducts />
        <div className="max-[844px]:hidden">
          <Testimonials />
        </div>
      </main>
      <Footer />
    </div>
  )
}
