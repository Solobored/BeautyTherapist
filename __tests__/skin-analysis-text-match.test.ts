import { scoreProductTextForSkinProfile, rankRelevantBlogPosts } from '@/lib/skin-analysis'

describe('skin-analysis text matching', () => {
  it('scores product descriptions with skin concerns and ingredients', () => {
    const profile = 'piel grasa con brillo y poros dilatados; quiero reducir brillo y controlar acne'
    const productText = 'Suero matificante para piel grasa con niacinamida, ácido salicílico y control de sebo para poros dilatados.'

    expect(scoreProductTextForSkinProfile(profile, productText)).toBeGreaterThan(0)
  })

  it('ranks blog content related to the user concern higher', () => {
    const profile = 'piel grasa con brotes y exceso de brillo'
    const posts = [
      { title: 'Rutina de hidratación profunda', content: 'Cómo mantener la piel hidratada y evitar irritaciones.' },
      { title: 'Piel grasa y poros dilatados', content: 'Aprende a controlar la producción de sebo, brillo y brotes en piel grasa.' },
    ]

    const ranked = rankRelevantBlogPosts(profile, posts)
    expect(ranked[0].title).toContain('Piel grasa')
  })
})
