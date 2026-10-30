import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { Star } from 'lucide-react'
import { fetchHomeTestimonials } from '@/lib/home-testimonials'

export async function Testimonials() {
  noStore()
  const testimonials = await fetchHomeTestimonials()

  if (testimonials.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
            Reviews
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Lo que dicen nuestras clientas
          </h2>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="bg-primary/10 rounded-2xl p-6 md:p-8">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < testimonial.rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium text-foreground">
                  {testimonial.customerName.trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{testimonial.customerName}</span>
                  {testimonial.verifiedPurchase && (
                    <span className="block text-xs text-muted-foreground">Compra verificada</span>
                  )}
                </div>
                <Link href={`/shop/${testimonial.productId}`} className="text-xs font-medium text-accent hover:underline">
                  Ver producto
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
