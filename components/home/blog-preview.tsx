'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { blogPosts } from '@/lib/data'

const categoryLabels = {
  skincare: { en: 'Skincare Routine', es: 'Rutina de Skincare' },
  ingredients: { en: 'Ingredient Guide', es: 'Guía de Ingredientes' },
  makeup: { en: 'Makeup Tutorial', es: 'Tutorial de Maquillaje' },
  wellness: { en: 'Wellness', es: 'Bienestar' }
}

export function BlogPreview() {
  const { language, t } = useLanguage()
  
  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
            Journal
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            {t('blog.title')}
          </h2>
        </div>
        
        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.slice(0, 3).map((post) => (
            <Link 
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
                {/* Cover Image */}
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={language === 'es' ? post.titleEs : post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 px-3 py-1 bg-background/90 backdrop-blur-sm text-xs font-medium rounded-full">
                    {categoryLabels[post.category][language]}
                  </span>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {language === 'es' ? post.titleEs : post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {language === 'es' ? post.excerptEs : post.excerpt}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-accent">
                    {t('blog.readMore')}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-10">
          <Button 
            asChild
            variant="outline"
            className="rounded-full"
          >
            <Link href="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
