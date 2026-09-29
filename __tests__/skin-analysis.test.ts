import {
  getAnalysisTagSlugs,
  isSkinSessionToken,
  normalizeAllowedValues,
  prefersLowerPrice,
  rankSkinProductMatches,
  scoreSkinTagMatches,
} from '@/lib/skin-analysis'

describe('skin analysis helpers', () => {
  it('accepts UUID session tokens and rejects arbitrary strings', () => {
    expect(isSkinSessionToken('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(isSkinSessionToken('not-a-session-token')).toBe(false)
  })

  it('deduplicates allowed values and rejects values outside the catalog', () => {
    expect(normalizeAllowedValues(['acne', 'acne'], ['acne', 'rosacea'])).toEqual(['acne'])
    expect(normalizeAllowedValues(['unknown'], ['acne', 'rosacea'])).toBeNull()
    expect(normalizeAllowedValues('acne', ['acne'])).toBeNull()
  })

  it('maps the skin type and profile choices to catalog slugs', () => {
    expect(getAnalysisTagSlugs({ skinType: 'grasa', concerns: ['acne'], goals: ['hidratar'] })).toEqual([
      'piel_grasa',
      'acne',
      'hidratar',
    ])
  })

  it('prioritizes skin type and concerns over general goals', () => {
    expect(scoreSkinTagMatches(['piel_grasa', 'acne', 'hidratar'], ['piel_grasa', 'acne', 'hidratar'])).toBe(6)
    expect(scoreSkinTagMatches(['acne', 'hidratar'], ['acne', 'hidratar'])).toBe(3)
  })

  it('recognizes price requests without matching ordinary skin descriptions', () => {
    expect(prefersLowerPrice('Quiero la opción más económica para mi piel')).toBe(true)
    expect(prefersLowerPrice('I want the cheapest option')).toBe(true)
    expect(prefersLowerPrice('Mi piel es mixta y sensible')).toBe(false)
  })

  it('keeps skin match first unless the user prioritizes price', () => {
    const matches = [
      { product: { id: 'best', price: 25000 }, score: 5, createdAt: '2026-01-01' },
      { product: { id: 'cheap', price: 10000 }, score: 2, createdAt: '2026-01-02' },
    ]

    expect(rankSkinProductMatches(matches).map(({ id }) => id)).toEqual(['best', 'cheap'])
    expect(rankSkinProductMatches(matches, true).map(({ id }) => id)).toEqual(['cheap', 'best'])
  })
})