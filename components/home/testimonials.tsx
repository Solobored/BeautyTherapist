import Image from 'next/image'
import { unstable_noStore as noStore } from 'next/cache'
import { Star } from 'lucide-react'
import { fetchHomeTestimonials } from '@/lib/home-testimonials'

export async function Testimonials() {
  noStore()
  const testimonials = await fetchHomeTestimonials()

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
            <div 
              key={testimonial.id}
              className="bg-primary/10 rounded-2xl p-6 md:p-8"
            >
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
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={testimonial.customerImage}
                    alt={testimonial.customerName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="block font-medium text-foreground">{testimonial.customerName}</span>
                  {testimonial.brandName ? (
                    <span className="block text-xs text-muted-foreground">{testimonial.brandName}</span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
