import {
  getAnalysisTagSlugs,
  isSkinSessionToken,
  normalizeAllowedValues,
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

  it('weights a matching skin type twice as much as other tags', () => {
    expect(scoreSkinTagMatches(['piel_grasa', 'acne', 'hidratar'], ['piel_grasa', 'acne'])).toBe(3)
  })
})