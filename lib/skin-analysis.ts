import type { SkinAnalysisSource, SkinType } from '@/types/skin-analysis'

export const SKIN_TYPES: SkinType[] = ['seca', 'grasa', 'mixta', 'normal', 'sensible']

export const SKIN_CONCERNS = [
  'rosacea',
  'acne',
  'manchas',
  'deshidratacion',
  'poros_dilatados',
] as const

export const SKIN_GOALS = ['hidratar', 'reducir_brillo', 'antiedad', 'calmar_rojeces'] as const

export const SKIN_TYPE_TAGS: Record<SkinType, string> = {
  seca: 'piel_seca',
  grasa: 'piel_grasa',
  mixta: 'piel_mixta',
  normal: 'piel_normal',
  sensible: 'piel_sensible',
}

const PRODUCT_MATCH_KEYWORDS: Record<string, string[]> = {
  grasa: ['grasa', 'sebo', 'brillo', 'aceite', 'oleosa', 'mattifying', 'matificante'],
  seca: ['seca', 'deshidratada', 'tirante', 'hidratante', 'humectante', 'barrier', 'restaurar'],
  mixta: ['mixta', 'zona t', 'zonas mixtas', 'equilibrante', 'normalizador'],
  normal: ['normal', 'equilibrada', 'sana', 'radiante'],
  sensible: ['sensible', 'reactiva', 'irritada', 'calmante', 'barrier', 'suave'],
  rosacea: ['rosacea', 'rojeces', 'enrojecimiento', 'calmar', 'relajante'],
  acne: ['acne', 'brotacion', 'granitos', 'espinillas', 'clarificante', 'salicilico', 'benzoyl'],
  manchas: ['manchas', 'hiperpigmentacion', 'discoloration', 'brillo', 'iluminador', 'despigmentante'],
  deshidratacion: ['deshidratacion', 'hidratante', 'humectante', 'aqua', 'glicerina'],
  poros_dilatados: ['poros dilatados', 'poros', 'mattifying', 'minimiza poros', 'control de sebo'],
  hidratar: ['hidratante', 'hidratacion', 'aceite', 'sativa', 'humectante', 'emoliente'],
  reducir_brillo: ['matificante', 'control sebo', 'brillo', 'oil control', 'reduccion brillo'],
  antiedad: ['antiedad', 'retinol', 'bakuchiol', 'peptides', 'colageno', 'renovador'],
  calmar_rojeces: ['calmar', 'soothing', 'rojeces', 'sensible', 'anti-irritation'],
}

export type SkinAnalysisInput = {
  skinType: SkinType | null
  concerns: string[]
  goals: string[]
  source: SkinAnalysisSource
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function prefersLowerPrice(value: string) {
  const normalized = normalizeText(value)
  return /\b(?:barat[oa]s?|mas\s+barat[oa]s?|economic[oa]s?|mas\s+economic[oa]s?|de\s+menor\s+precio|precio\s+(?:mas\s+bajo|menor)|menos\s+caro|(?:que|el)\s+cueste\s+menos|cheap(?:est)?|lowest\s+price|less\s+expensive|affordable|budget)\b/.test(normalized)
}

export function rankSkinProductMatches<T extends { price: number }>(
  matches: Array<{ product: T; score: number; createdAt: string }>,
  prioritizePrice = false,
) {
  return [...matches]
    .sort((left, right) => {
      const scoreDifference = right.score - left.score
      const priceDifference = left.product.price - right.product.price
      const recencyDifference = right.createdAt.localeCompare(left.createdAt)
      return prioritizePrice
        ? priceDifference || scoreDifference || recencyDifference
        : scoreDifference || priceDifference || recencyDifference
    })
    .map(({ product }) => product)
}

export function buildSkinProfileText(skinType: SkinType | null, concerns: string[] = [], goals: string[] = [], notes?: string | null) {
  const context = [
    skinType ? `piel ${skinType}` : '',
    ...concerns,
    ...goals,
    notes ?? '',
  ]
    .filter(Boolean)
    .map((part) => normalizeText(String(part)))
    .join(' ')

  return context.trim()
}

export function getAnalysisTagSlugs(input: Pick<SkinAnalysisInput, 'skinType' | 'concerns' | 'goals'>) {
  return [
    ...(input.skinType ? [SKIN_TYPE_TAGS[input.skinType]] : []),
    ...input.concerns,
    ...input.goals,
  ]
}

export function scoreSkinTagMatches(matchedSlugs: string[], requestedSlugs: string[]) {
  const requested = new Set(requestedSlugs)
  const weightedSkinTypes = new Set(Object.values(SKIN_TYPE_TAGS))
  return matchedSlugs.reduce(
    (score, slug) => score + (
      !requested.has(slug)
        ? 0
        : weightedSkinTypes.has(slug)
          ? 3
          : SKIN_CONCERNS.includes(slug as typeof SKIN_CONCERNS[number])
            ? 2
            : 1
    ),
    0,
  )
}

export function scoreProductTextForSkinProfile(profileText: string, productText: string) {
  const normalizedProfile = normalizeText(profileText)
  const normalizedProduct = normalizeText(productText)
  if (!normalizedProfile || !normalizedProduct) return 0

  const profileWords = new Set(normalizedProfile.split(/\s+/).filter(Boolean))
  const productWords = normalizedProduct.split(/\s+/).filter(Boolean)

  let score = 0
  for (const word of productWords) {
    if (profileWords.has(word)) score += 3
  }

  for (const [keyword, variants] of Object.entries(PRODUCT_MATCH_KEYWORDS)) {
    if (!normalizedProfile.includes(keyword)) continue
    for (const variant of variants) {
      if (normalizedProduct.includes(variant)) {
        score += 5
      }
    }
  }

  if (/acne|granitos|espinillas|brotes/.test(normalizedProfile) && /(salicilico|benzoyl|acne|clarificante|exfoliante)/.test(normalizedProduct)) score += 6
  if (/grasa|brillo|sebo|poros/.test(normalizedProfile) && /(matificante|sebo|poros|control de brillo|oil control)/.test(normalizedProduct)) score += 6
  if (/seca|deshidrat|tirante/.test(normalizedProfile) && /(hidratante|humectante|glicerina|aceite|barrier)/.test(normalizedProduct)) score += 6
  if (/sensible|rojeces|irritada|calmar/.test(normalizedProfile) && /(calmante|suave|sensible|anti irritacion|rocacea)/.test(normalizedProduct)) score += 6

  return score
}

export function rankRelevantBlogPosts<T extends { title?: string | null; content?: string | null; slug?: string | null }>(profileText: string, posts: T[]) {
  return [...posts]
    .map((post) => {
      const title = post.title ?? ''
      const content = post.content ?? ''
      const score = scoreProductTextForSkinProfile(profileText, `${title} ${content}`)
      return { ...post, score }
    })
    .filter((post) => post.score > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3)
}

export function isSkinSessionToken(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  )
}

export function normalizeAllowedValues(value: unknown, allowed: readonly string[]) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) return null
  const unique = [...new Set(value)]
  if (unique.some((entry) => !allowed.includes(entry))) return null
  return unique as string[]
}

export function isSkinAnalysisSource(value: unknown): value is SkinAnalysisSource {
  return ['form', 'professional_report', 'ai_photo', 'ai_text'].includes(String(value))
}