export type SeoLandingPage = {
  slug: string
  title: string
  shortTitle: string
  description: string
  category?: 'skincare' | 'makeup'
  heroEyebrow: string
  heroTitle: string
  heroDescription: string
  keywords: string[]
  searchIntents: string[]
  faq: Array<{
    question: string
    answer: string
  }>
}

export const seoLandingPages: SeoLandingPage[] = [
  {
    slug: 'skincare-profesional',
    title: 'Skincare profesional en Chile',
    shortTitle: 'Skincare profesional',
    description:
      'Descubre productos de skincare profesional para rutinas de cuidado facial: sérums, hidratantes y tratamientos seleccionados.',
    category: 'skincare',
    heroEyebrow: 'Cuidado facial',
    heroTitle: 'Skincare profesional para elevar tu rutina',
    heroDescription:
      'Explora productos de cuidado facial para hidratar, iluminar y complementar tu rutina diaria con marcas de belleza seleccionadas.',
    keywords: [
      'skincare profesional',
      'productos skincare chile',
      'cuidado facial profesional',
      'rutina skincare',
      'cosmetica facial chile',
    ],
    searchIntents: [
      'Comprar skincare profesional online',
      'Armar una rutina de cuidado facial',
      'Encontrar productos para hidratar e iluminar la piel',
    ],
    faq: [
      {
        question: '¿Qué productos incluye una rutina de skincare?',
        answer:
          'Una rutina suele incluir limpieza, hidratación, tratamiento específico y protección solar. En Beauty & Therapy puedes descubrir productos para complementar esos pasos.',
      },
      {
        question: '¿Cómo elegir skincare profesional?',
        answer:
          'Revisa el tipo de producto, ingredientes, modo de uso, reseñas y necesidades de tu piel antes de comprar.',
      },
    ],
  },
  {
    slug: 'maquillaje-profesional',
    title: 'Maquillaje profesional en Chile',
    shortTitle: 'Maquillaje profesional',
    description:
      'Compra maquillaje profesional online: bases, productos para labios, ojos y acabados premium seleccionados por marcas de belleza.',
    category: 'makeup',
    heroEyebrow: 'Makeup premium',
    heroTitle: 'Maquillaje profesional para looks pulidos',
    heroDescription:
      'Encuentra maquillaje para uso diario, eventos y acabados profesionales, con productos seleccionados y compra directa.',
    keywords: [
      'maquillaje profesional',
      'comprar maquillaje profesional chile',
      'maquillaje premium',
      'productos de maquillaje chile',
      'tienda maquillaje online',
    ],
    searchIntents: [
      'Comprar maquillaje profesional online',
      'Encontrar maquillaje premium en Chile',
      'Buscar productos para un look natural o de evento',
    ],
    faq: [
      {
        question: '¿Dónde comprar maquillaje profesional en Chile?',
        answer:
          'Beauty & Therapy reúne productos de maquillaje y marcas de belleza para comprar online desde Chile.',
      },
      {
        question: '¿Qué considerar al elegir maquillaje profesional?',
        answer:
          'Considera acabado, tono, duración, ingredientes, reseñas y compatibilidad con tu tipo de piel.',
      },
    ],
  },
]

export function getSeoLandingPage(slug: string) {
  return seoLandingPages.find((page) => page.slug === slug) ?? null
}
