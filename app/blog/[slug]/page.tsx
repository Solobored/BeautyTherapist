'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, ArrowLeft, Calendar, User } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { blogPosts } from '@/lib/data'
import { notFound } from 'next/navigation'

const categoryLabels = {
  skincare: { en: 'Skincare Routine', es: 'Rutina de Skincare' },
  ingredients: { en: 'Ingredient Guide', es: 'Guía de Ingredientes' },
  makeup: { en: 'Makeup Tutorial', es: 'Tutorial de Maquillaje' },
  wellness: { en: 'Wellness', es: 'Bienestar' }
}

// Extended content for articles
const articleContent = {
  'morning-skincare-routine-glowing-skin': {
    en: `
      <p>Starting your day with the right skincare routine sets the foundation for healthy, glowing skin that lasts all day long. In this guide, we'll walk you through the essential steps for a morning routine that will transform your complexion.</p>
      
      <h2>Step 1: Gentle Cleansing</h2>
      <p>Begin your morning by cleansing your face with a gentle, pH-balanced cleanser. Unlike the double cleanse you might do at night, a single gentle wash is often enough in the morning to remove any overnight buildup without stripping your skin of its natural oils.</p>
      
      <h2>Step 2: Toning</h2>
      <p>Apply a hydrating toner to balance your skin's pH and prep it for the products that follow. Look for toners with ingredients like hyaluronic acid or niacinamide for added benefits.</p>
      
      <h2>Step 3: Serum Application</h2>
      <p>This is where you can target specific skin concerns. A vitamin C serum like the AngeBae Radiance Glow Serum is perfect for morning use – it provides antioxidant protection and brightens your complexion throughout the day.</p>
      
      <h2>Step 4: Eye Cream</h2>
      <p>Gently pat a small amount of eye cream around your orbital bone. The eye area is delicate and deserves special attention with a targeted product.</p>
      
      <h2>Step 5: Moisturizer</h2>
      <p>Lock in all the goodness with a nourishing moisturizer. Choose one that suits your skin type – lighter gels for oily skin, richer creams for dry skin.</p>
      
      <h2>Step 6: Sunscreen</h2>
      <p>The most important step! Apply a broad-spectrum SPF 30 or higher as the final step of your routine. This protects your skin from UV damage and prevents premature aging.</p>
      
      <h2>Pro Tips</h2>
      <ul>
        <li>Apply products from thinnest to thickest consistency</li>
        <li>Wait 30 seconds between layers for better absorption</li>
        <li>Don't forget your neck and décolletage</li>
        <li>Consistency is key – stick with your routine for at least 4-6 weeks to see results</li>
      </ul>
    `,
    es: `
      <p>Comenzar tu día con la rutina de skincare correcta establece las bases para una piel saludable y radiante que dura todo el día. En esta guía, te guiaremos a través de los pasos esenciales para una rutina matutina que transformará tu cutis.</p>
      
      <h2>Paso 1: Limpieza Suave</h2>
      <p>Comienza tu mañana limpiando tu rostro con un limpiador suave y de pH equilibrado. A diferencia de la doble limpieza que podrías hacer por la noche, una sola lavada suave suele ser suficiente por la mañana para eliminar cualquier acumulación nocturna sin despojar tu piel de sus aceites naturales.</p>
      
      <h2>Paso 2: Tónico</h2>
      <p>Aplica un tónico hidratante para equilibrar el pH de tu piel y prepararla para los productos que siguen. Busca tónicos con ingredientes como ácido hialurónico o niacinamida para beneficios adicionales.</p>
      
      <h2>Paso 3: Aplicación de Sérum</h2>
      <p>Aquí es donde puedes abordar preocupaciones específicas de la piel. Un sérum de vitamina C como el Sérum Resplandor Radiante de AngeBae es perfecto para uso matutino – proporciona protección antioxidante e ilumina tu cutis durante todo el día.</p>
      
      <h2>Paso 4: Crema de Ojos</h2>
      <p>Da pequeños toques con una pequeña cantidad de crema de ojos alrededor del hueso orbital. El área de los ojos es delicada y merece atención especial con un producto específico.</p>
      
      <h2>Paso 5: Hidratante</h2>
      <p>Sella toda la bondad con una crema hidratante nutritiva. Elige una que se adapte a tu tipo de piel – geles más ligeros para piel grasa, cremas más ricas para piel seca.</p>
      
      <h2>Paso 6: Protector Solar</h2>
      <p>¡El paso más importante! Aplica un SPF de amplio espectro 30 o superior como el paso final de tu rutina. Esto protege tu piel del daño UV y previene el envejecimiento prematuro.</p>
      
      <h2>Consejos Pro</h2>
      <ul>
        <li>Aplica productos de la consistencia más fina a la más gruesa</li>
        <li>Espera 30 segundos entre capas para mejor absorción</li>
        <li>No olvides tu cuello y escote</li>
        <li>La consistencia es clave – mantén tu rutina durante al menos 4-6 semanas para ver resultados</li>
      </ul>
    `
  },
  'understanding-niacinamide-benefits': {
    en: `
      <p>Niacinamide, also known as vitamin B3, has taken the skincare world by storm. This powerhouse ingredient offers a multitude of benefits for various skin types and concerns. Let's dive deep into what makes niacinamide so special.</p>
      
      <h2>What is Niacinamide?</h2>
      <p>Niacinamide is a water-soluble vitamin that works with the natural substances in your skin to help minimize pores, improve uneven skin tone, soften fine lines and wrinkles, diminish dullness, and strengthen a weakened surface.</p>
      
      <h2>Key Benefits</h2>
      
      <h3>1. Minimizes Pores</h3>
      <p>Niacinamide helps regulate sebum production, which can help prevent clogged pores and minimize their appearance over time.</p>
      
      <h3>2. Brightens Skin Tone</h3>
      <p>Studies have shown that niacinamide can help reduce the appearance of dark spots and hyperpigmentation by inhibiting melanin transfer.</p>
      
      <h3>3. Strengthens Skin Barrier</h3>
      <p>This vitamin helps build proteins in the skin and lock in moisture to prevent environmental damage.</p>
      
      <h3>4. Reduces Inflammation</h3>
      <p>Niacinamide has anti-inflammatory properties that can help calm acne-prone and sensitive skin.</p>
      
      <h2>How to Use Niacinamide</h2>
      <p>Niacinamide is incredibly versatile and plays well with most other skincare ingredients. Look for products containing 2-5% niacinamide for best results without irritation.</p>
      
      <h2>What to Pair It With</h2>
      <ul>
        <li>Hyaluronic acid for hydration</li>
        <li>Retinol for anti-aging benefits</li>
        <li>Vitamin C (contrary to old myths, they work great together!)</li>
      </ul>
    `,
    es: `
      <p>La niacinamida, también conocida como vitamina B3, ha revolucionado el mundo del skincare. Este ingrediente poderoso ofrece una multitud de beneficios para varios tipos de piel y preocupaciones. Vamos a profundizar en lo que hace a la niacinamida tan especial.</p>
      
      <h2>¿Qué es la Niacinamida?</h2>
      <p>La niacinamida es una vitamina soluble en agua que trabaja con las sustancias naturales de tu piel para ayudar a minimizar poros, mejorar el tono desigual de la piel, suavizar líneas finas y arrugas, disminuir la opacidad y fortalecer una superficie debilitada.</p>
      
      <h2>Beneficios Clave</h2>
      
      <h3>1. Minimiza Poros</h3>
      <p>La niacinamida ayuda a regular la producción de sebo, lo que puede ayudar a prevenir poros obstruidos y minimizar su apariencia con el tiempo.</p>
      
      <h3>2. Ilumina el Tono de Piel</h3>
      <p>Estudios han demostrado que la niacinamida puede ayudar a reducir la apariencia de manchas oscuras e hiperpigmentación al inhibir la transferencia de melanina.</p>
      
      <h3>3. Fortalece la Barrera de la Piel</h3>
      <p>Esta vitamina ayuda a construir proteínas en la piel y sellar la humedad para prevenir el daño ambiental.</p>
      
      <h3>4. Reduce la Inflamación</h3>
      <p>La niacinamida tiene propiedades antiinflamatorias que pueden ayudar a calmar la piel propensa al acné y la piel sensible.</p>
      
      <h2>Cómo Usar la Niacinamida</h2>
      <p>La niacinamida es increíblemente versátil y se combina bien con la mayoría de los otros ingredientes de skincare. Busca productos que contengan 2-5% de niacinamida para mejores resultados sin irritación.</p>
      
      <h2>Con Qué Combinarla</h2>
      <ul>
        <li>Ácido hialurónico para hidratación</li>
        <li>Retinol para beneficios anti-edad</li>
        <li>Vitamina C (¡contrario a mitos antiguos, funcionan muy bien juntos!)</li>
      </ul>
    `
  },
  'natural-no-makeup-makeup-look': {
    en: `
      <p>The "no-makeup" makeup look is all about enhancing your natural features while appearing effortlessly radiant. This look celebrates your skin rather than masking it. Here's how to achieve this coveted fresh-faced aesthetic.</p>
      
      <h2>Prep Your Skin</h2>
      <p>Great makeup starts with great skincare. Make sure your skin is clean, hydrated, and primed. A dewy moisturizer and a blurring primer create the perfect canvas.</p>
      
      <h2>Light Coverage Base</h2>
      <p>Skip heavy foundations. Instead, opt for a tinted moisturizer, BB cream, or a light coverage foundation like the AngeBae Silk Foundation SPF 30. Apply only where needed – usually the center of the face and any areas with discoloration.</p>
      
      <h2>Concealer Magic</h2>
      <p>Use a creamy, hydrating concealer sparingly. Dab it under the eyes, around the nose, and on any blemishes. Blend with a damp sponge for a seamless finish.</p>
      
      <h2>Cream Blush</h2>
      <p>Cream products give the most natural finish. Smile and dab cream blush on the apples of your cheeks, blending upward toward your temples.</p>
      
      <h2>Brows and Lashes</h2>
      <p>Fill in sparse areas with light, feathery strokes using a brow pencil. Use a clear brow gel to set. For lashes, a single coat of mascara on the upper lashes opens up the eyes naturally.</p>
      
      <h2>Lips and Glow</h2>
      <p>A lip tint or tinted balm gives a beautiful wash of color. The AngeBae Petal Soft Lip Tint is perfect for this look. Finish with a subtle highlighter on the high points of your face.</p>
      
      <h2>Key Tips</h2>
      <ul>
        <li>Use your fingers – the warmth helps products blend seamlessly</li>
        <li>Less is more – build coverage gradually</li>
        <li>Match your undertones for the most natural look</li>
        <li>Set with a dewy setting spray, not powder</li>
      </ul>
    `,
    es: `
      <p>El look de maquillaje "sin maquillaje" se trata de realzar tus rasgos naturales mientras te ves radiante sin esfuerzo. Este look celebra tu piel en lugar de enmascararla. Aquí te mostramos cómo lograr esta codiciada estética de rostro fresco.</p>
      
      <h2>Prepara Tu Piel</h2>
      <p>Un gran maquillaje comienza con un gran skincare. Asegúrate de que tu piel esté limpia, hidratada y preparada. Una crema hidratante dewy y un primer difuminador crean el lienzo perfecto.</p>
      
      <h2>Base de Cobertura Ligera</h2>
      <p>Evita las bases pesadas. En su lugar, opta por una crema hidratante con color, BB cream o una base de cobertura ligera como la Base de Seda SPF 30 de AngeBae. Aplica solo donde sea necesario – generalmente en el centro del rostro y cualquier área con decoloración.</p>
      
      <h2>Magia del Corrector</h2>
      <p>Usa un corrector cremoso e hidratante con moderación. Aplícalo debajo de los ojos, alrededor de la nariz y en cualquier imperfección. Difumina con una esponja húmeda para un acabado perfecto.</p>
      
      <h2>Rubor en Crema</h2>
      <p>Los productos en crema dan el acabado más natural. Sonríe y aplica rubor en crema en las manzanas de tus mejillas, difuminando hacia arriba hacia las sienes.</p>
      
      <h2>Cejas y Pestañas</h2>
      <p>Rellena las áreas escasas con trazos ligeros y plumosos usando un lápiz de cejas. Usa un gel de cejas transparente para fijar. Para las pestañas, una sola capa de máscara en las pestañas superiores abre los ojos naturalmente.</p>
      
      <h2>Labios y Brillo</h2>
      <p>Un tinte o bálsamo con color da un hermoso toque de color. El Tinte de Labios Pétalo Suave de AngeBae es perfecto para este look. Termina con un iluminador sutil en los puntos altos de tu rostro.</p>
      
      <h2>Consejos Clave</h2>
      <ul>
        <li>Usa tus dedos – el calor ayuda a difuminar los productos perfectamente</li>
        <li>Menos es más – construye la cobertura gradualmente</li>
        <li>Combina tus subtonos para el look más natural</li>
        <li>Fija con un spray fijador dewy, no polvo</li>
      </ul>
    `
  }
}

export default function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { language, t } = useLanguage()
  
  const post = blogPosts.find(p => p.slug === slug)
  
  if (!post) {
    notFound()
  }
  
  const title = language === 'es' ? post.titleEs : post.title
  const content = articleContent[slug as keyof typeof articleContent]?.[language] || post.content
  
  const relatedPosts = blogPosts.filter(p => p.category === post.category && p.id !== post.id).slice(0, 2)
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Hero */}
        <div className="relative h-64 md:h-96 bg-muted">
          <Image
            src={post.coverImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-12">
          {/* Article Card */}
          <article className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl shadow-lg p-6 md:p-10 border border-border/50">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/" className="hover:text-foreground transition-colors">{t('nav.home')}</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/blog" className="hover:text-foreground transition-colors">{t('nav.blog')}</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground truncate">{title}</span>
              </nav>
              
              {/* Category */}
              <span className="inline-block px-3 py-1 bg-primary/20 text-accent text-xs font-medium rounded-full mb-4">
                {categoryLabels[post.category][language]}
              </span>
              
              {/* Title */}
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-6 text-balance">
                {title}
              </h1>
              
              {/* Author & Date */}
              <div className="flex items-center gap-4 pb-6 border-b border-border mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={post.authorImage}
                      alt={post.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{post.author}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-accent prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:marker:text-accent"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              {/* Back Button */}
              <div className="mt-10 pt-6 border-t border-border">
                <Button variant="outline" asChild>
                  <Link href="/blog">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {language === 'es' ? 'Volver al Blog' : 'Back to Blog'}
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <section className="mt-12">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                  {language === 'es' ? 'Artículos Relacionados' : 'Related Articles'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link 
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="group"
                    >
                      <article className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
                        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                          <Image
                            src={relatedPost.coverImage}
                            alt={language === 'es' ? relatedPost.titleEs : relatedPost.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                            {language === 'es' ? relatedPost.titleEs : relatedPost.title}
                          </h3>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
