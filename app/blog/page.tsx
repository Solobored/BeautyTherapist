'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { blogPosts } from '@/lib/data'

const categoryLabels = {
  skincare: { en: 'Skincare Routine', es: 'Rutina de Skincare' },
  ingredients: { en: 'Ingredient Guide', es: 'Guía de Ingredientes' },
  makeup: { en: 'Makeup Tutorial', es: 'Tutorial de Maquillaje' },
  wellness: { en: 'Wellness', es: 'Bienestar' }
}

type CategoryFilter = 'all' | 'skincare' | 'ingredients' | 'makeup' | 'wellness'

export default function BlogPage() {
  const { language, t } = useLanguage()
  const [filter, setFilter] = useState<CategoryFilter>('all')
  
  const filteredPosts = filter === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === filter)
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
              Journal
            </span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
              {t('blog.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'es' 
                ? 'Descubre tips de belleza, guías de ingredientes y tutoriales de nuestros expertos.'
                : 'Discover beauty tips, ingredient guides, and tutorials from our experts.'
              }
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-accent text-accent-foreground' : ''}
            >
              {language === 'es' ? 'Todos' : 'All'}
            </Button>
            {(Object.keys(categoryLabels) as CategoryFilter[]).filter(cat => cat !== 'all').map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(cat)}
                className={filter === cat ? 'bg-accent text-accent-foreground' : ''}
              >
                {categoryLabels[cat][language]}
              </Button>
            ))}
          </div>
          
          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPosts.map((post) => (
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
                    <span className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm text-xs font-medium rounded-full">
                      {categoryLabels[post.category][language]}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={post.authorImage}
                          alt={post.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-foreground">{post.author}</p>
                        <p className="text-muted-foreground text-xs">{post.date}</p>
                      </div>
                    </div>
                    
                    <h2 className="font-serif text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                      {language === 'es' ? post.titleEs : post.title}
                    </h2>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
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
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {language === 'es' ? 'No hay artículos en esta categoría.' : 'No articles in this category.'}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
