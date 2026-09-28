'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, LoaderCircle, Sparkles, X } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/language-context'
import { SKIN_CONCERNS, SKIN_GOALS } from '@/lib/skin-analysis'
import type { StoreProduct } from '@/lib/product-types'

type ApiMessage = { error?: string }
type AnalysisSummary = { observations: string; disclaimer: string }

const LABELS = {
  skinTypes: {
    seca: ['Piel seca', 'Dry skin'],
    grasa: ['Piel grasa', 'Oily skin'],
    mixta: ['Piel mixta', 'Combination skin'],
    normal: ['Piel normal', 'Normal skin'],
    sensible: ['Piel sensible', 'Sensitive skin'],
  },
  concerns: {
    rosacea: ['Rojeces', 'Redness'],
    acne: ['Acne', 'Acne'],
    manchas: ['Manchas', 'Dark spots'],
    deshidratacion: ['Deshidratacion', 'Dehydration'],
    poros_dilatados: ['Poros dilatados', 'Enlarged pores'],
  },
  goals: {
    hidratar: ['Hidratar', 'Hydrate'],
    reducir_brillo: ['Reducir brillo', 'Reduce shine'],
    antiedad: ['Cuidado antiedad', 'Anti-aging care'],
    calmar_rojeces: ['Calmar rojeces', 'Soothe redness'],
  },
} as const

const DISCLAIMER = 'Las observaciones de Maien son orientativas y generadas por IA, no reemplazan una consulta con un dermatologo.'
const DISCLAIMER_EN = "Maien's observations are AI-generated guidance, not a substitute for a consultation with a dermatologist."
const ANALYSIS_PRIVACY = 'No usamos fotos ni datos personales. Solo tomamos la descripción de tu piel para recomendarte productos relevantes.'
const ANALYSIS_PRIVACY_EN = 'We do not use photos or personal details. We only use your skin description to recommend relevant products.'

export function MaienCard({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage()
  const isEnglish = language === 'en'
  const [sessionToken, setSessionToken] = useState('')
  const [analysisId, setAnalysisId] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [description, setDescription] = useState('')
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [skinType, setSkinType] = useState('')
  const [concerns, setConcerns] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<AnalysisSummary | null>(null)
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [blogPosts, setBlogPosts] = useState<Array<{ id: string; title: string; slug: string; content: string; coverImage: string; category: string; author: string; publishedAt: string }>>([])
  const [resultMode, setResultMode] = useState('matched')
  const [reportFileUrl, setReportFileUrl] = useState('')

  useEffect(() => {
    let token = ''
    try {
      token = localStorage.getItem('maien-session-token') ?? ''
      if (!token) {
        token = window.crypto.randomUUID()
        localStorage.setItem('maien-session-token', token)
      }
    } catch {
      token = window.crypto.randomUUID()
    }
    setSessionToken(token)
  }, [])

  useEffect(() => {
    if (!showResults || !analysisId || !sessionToken) return
    let cancelled = false
    setBusy(true)
    setError('')
    void (async () => {
      try {
        const response = await fetch(`/api/products/recommendations?analysisId=${encodeURIComponent(analysisId)}`, {
          headers: { 'x-skin-session': sessionToken },
          cache: 'no-store',
        })
        const data = await response.json()
        if (!response.ok) throw new Error((data as ApiMessage).error || 'No se pudieron cargar las recomendaciones')
        if (cancelled) return
        setProducts(data.products ?? [])
        setBlogPosts(data.blogPosts ?? [])
        setResultMode(data.mode ?? 'matched')
        setReportFileUrl(data.analysis?.reportFileUrl ?? '')
        if (data.analysis?.aiObservations) {
          setSummary({ observations: data.analysis.aiObservations, disclaimer: isEnglish ? DISCLAIMER_EN : DISCLAIMER })
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Error al cargar recomendaciones')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [showResults, analysisId, sessionToken, isEnglish])

  const submitAiAnalysis = async () => {
    if (!privacyConsent) {
      setError(isEnglish ? 'Please accept the privacy notice first.' : 'Acepta el aviso de privacidad para continuar.')
      return
    }
    if (!description.trim()) return
    setBusy(true)
    setError('')
    setSummary(null)
    try {
      const response = await fetch('/api/skin-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          privacyConsent: true,
          textDescription: description.trim(),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error((data as ApiMessage).error || 'Maien no está disponible en este momento.')
      setAnalysisId(data.analysisId)
      setSummary({ observations: data.observations, disclaimer: isEnglish ? DISCLAIMER_EN : data.disclaimer })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Maien no está disponible en este momento.')
    } finally {
      setBusy(false)
    }
  }

  const submitManualAnalysis = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!privacyConsent) {
      setError(isEnglish ? 'Please accept the privacy notice first.' : 'Acepta el aviso de privacidad para continuar.')
      return
    }
    if (!skinType) {
      setError(isEnglish ? 'Choose your skin type.' : 'Selecciona tu tipo de piel.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/skin-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, privacyConsent: true, skinType, concerns, goals }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error((data as ApiMessage).error || 'No se pudo guardar el análisis')
      setSummary(null)
      setAnalysisId(data.analysisId)
      setShowResults(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar el análisis')
    } finally {
      setBusy(false)
    }
  }

  const showRecommendations = () => {
    if (!analysisId) return
    setShowResults(true)
  }

  const resetAnalysis = () => {
    setAnalysisId('')
    setShowResults(false)
    setSummary(null)
    setProducts([])
    setError('')
    setDescription('')
    setBlogPosts([])
    setShowManual(false)
  }

  const deleteAnalysis = async () => {
    if (!analysisId || !sessionToken) return
    const confirmed = window.confirm(isEnglish ? 'Delete this skin analysis and its report?' : '¿Eliminar este análisis de piel y su informe?')
    if (!confirmed) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/skin-analysis/${encodeURIComponent(analysisId)}`, {
        method: 'DELETE',
        headers: { 'x-skin-session': sessionToken },
      })
      const data = await response.json()
      if (!response.ok) throw new Error((data as ApiMessage).error || 'No se pudo eliminar el análisis')
      resetAnalysis()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo eliminar el análisis')
    } finally {
      setBusy(false)
    }
  }

  const toggleChoice = (values: string[], setValues: (next: string[]) => void, value: string) => {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  return (
    <section className={`w-full ${showResults || showManual ? 'max-h-[min(78vh,720px)] overflow-y-auto' : 'overflow-hidden'}`}>
      <div className="flex justify-end border-b border-border px-4 py-2">
        <Button type="button" variant="ghost" size="icon-sm" aria-label={isEnglish ? 'Close Maien' : 'Cerrar Maien'} onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      {showResults ? (
        <div className="p-4 sm:p-6">
          <Button variant="ghost" onClick={resetAnalysis} className="mb-5 px-0 text-foreground hover:bg-transparent">
            <ArrowLeft className="size-4" />
            {isEnglish ? 'New skin analysis' : 'Nuevo análisis de piel'}
          </Button>
          <div className="mb-6 flex items-start gap-4 border-b border-border pb-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/40 text-foreground">
              <Sparkles className="size-6" />
            </span>
            <div>
              <p className="font-serif text-2xl font-semibold">Maien</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isEnglish ? 'Recommendations selected for your skin profile' : 'Recomendaciones para tu perfil de piel'}
              </p>
            </div>
          </div>
          {busy ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-muted-foreground" role="status">
              <LoaderCircle className="size-5 animate-spin" />
              {isEnglish ? 'Loading recommendations...' : 'Cargando recomendaciones...'}
            </div>
          ) : error ? (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
          ) : (
            <>
              {summary && (
                <div className="mb-8 max-w-3xl space-y-2">
                  <p className="text-lg leading-relaxed text-foreground">{summary.observations}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{summary.disclaimer}</p>
                </div>
              )}
              {resultMode === 'review-with-specialist' && (
                <div className="mb-6 border-l-4 border-accent bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                  {isEnglish
                    ? 'These products are options to review with your specialist; the uploaded report was not interpreted.'
                    : 'Estas opciones son para revisar con tu especialista; el informe subido no fue interpretado.'}
                  {reportFileUrl && <a className="ml-2 underline" href={reportFileUrl} target="_blank" rel="noreferrer">{isEnglish ? 'View report' : 'Ver informe'}</a>}
                </div>
              )}
              {products.length ? (
                <div className="grid grid-cols-1 gap-3">
                  {products.map((product) => (
                    <div key={product.id}>
                      <ProductCard product={product} layout="horizontal" />
                      {product.skinNotes && (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {isEnglish ? 'Seller note:' : 'Recomendado por el vendedor para:'} {product.skinNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-y border-border py-8 text-sm text-muted-foreground">
                  {isEnglish
                    ? 'No tagged products match this profile yet. Browse all products instead.'
                    : 'Aún no hay productos etiquetados para este perfil. Puedes explorar todo el catálogo.'}
                  <a href="/shop" className="ml-2 font-medium text-accent underline">{isEnglish ? 'Browse products' : 'Ver productos'}</a>
                </div>
              )}

              {blogPosts.length > 0 && (
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="mb-4 font-serif text-xl font-semibold text-foreground">
                    {isEnglish ? 'Related articles' : 'Artículos relacionados'}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {blogPosts.map((post) => (
                      <a key={post.id} href={`/blog/${post.slug}`} className="block rounded-xl border border-border bg-card p-3 transition hover:border-accent/60">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{post.category}</p>
                        <h4 className="mt-2 text-sm font-semibold text-foreground">{post.title}</h4>
                        <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{post.content}</p>
                        <span className="mt-3 inline-block text-[11px] font-medium text-accent">{isEnglish ? 'Read article' : 'Leer artículo'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-8 text-xs leading-relaxed text-muted-foreground">{isEnglish ? DISCLAIMER_EN : DISCLAIMER}</p>
              <div className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
                {isEnglish ? 'Want to save your profile?' : '¿Quieres guardar tu perfil?'}{' '}
                <a href="/auth/register" className="font-medium text-accent underline">
                  {isEnglish ? 'Create a free account' : 'Crea una cuenta gratis'}
                </a>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => void deleteAnalysis()} disabled={busy}>
                  {isEnglish ? 'Delete my analysis' : 'Eliminar mi análisis'}
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-background">
          <div className="border-b border-border bg-secondary p-5 sm:p-7">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">Maien</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isEnglish ? 'Tell me about your skin and I will recommend products' : 'Cuéntame tu piel y te recomiendo productos'}
              </p>
            </div>
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            <form
              onSubmit={(event) => { event.preventDefault(); void submitAiAnalysis() }}
              className="min-w-0"
            >
              <Label htmlFor="skin-description" className="mb-3 block text-sm font-semibold">
                {isEnglish ? 'Describe how your skin feels' : 'Describe cómo sientes tu piel'}
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="skin-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={1200}
                  placeholder={isEnglish ? 'e.g. oily skin with small breakouts on my forehead' : 'Ej: piel grasa con granitos en la frente'}
                  className="min-w-0"
                />
                <Button type="submit" disabled={busy || !description.trim() || !privacyConsent}>
                  {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {isEnglish ? 'Send' : 'Enviar'}
                </Button>
              </div>
            </form>

            <div className="flex items-start gap-3 border-y border-[#e5ebe3] py-4">
              <Checkbox id="skin-privacy-consent" checked={privacyConsent} onCheckedChange={(checked) => setPrivacyConsent(checked === true)} />
              <Label htmlFor="skin-privacy-consent" className="cursor-pointer text-xs font-normal leading-relaxed text-muted-foreground">
                {isEnglish ? ANALYSIS_PRIVACY_EN : ANALYSIS_PRIVACY}
              </Label>
            </div>

            {error && <p role="alert" className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

            {summary && (
              <div className="max-w-3xl space-y-3 border-l-4 border-primary pl-4">
                <p className="leading-relaxed">{summary.observations}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{summary.disclaimer}</p>
                <Button onClick={showRecommendations} disabled={busy}>
                  {isEnglish ? 'See my recommendations' : 'Ver mis recomendaciones'}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}

            {!summary && !showManual && (
              <button
                type="button"
                onClick={() => { setError(''); setShowManual(true) }}
                className="text-sm font-medium text-accent underline underline-offset-4 hover:text-accent/80"
              >
                {isEnglish ? 'I prefer to choose myself' : 'Prefiero elegir yo'}
              </button>
            )}

            {showManual && (
              <form onSubmit={submitManualAnalysis} className="space-y-6 border-t border-border pt-6 pr-1">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-serif text-xl font-semibold">
                    {isEnglish ? 'Your skin profile' : 'Tu perfil de piel'}
                  </h2>
                  <button type="button" onClick={() => setShowManual(false)} className="text-sm text-muted-foreground underline">
                    {isEnglish ? 'Back to Maien' : 'Volver a Maien'}
                  </button>
                </div>
                <div className="max-w-sm space-y-2">
                  <Label htmlFor="skin-type">{isEnglish ? 'Skin type' : 'Tipo de piel'}</Label>
                  <select
                    id="skin-type"
                    value={skinType}
                    onChange={(event) => setSkinType(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="">{isEnglish ? 'Choose one' : 'Selecciona una opción'}</option>
                    {Object.entries(LABELS.skinTypes).map(([value, labels]) => (
                      <option key={value} value={value}>{labels[isEnglish ? 1 : 0]}</option>
                    ))}
                  </select>
                </div>
                <ChoiceGroup
                  title={isEnglish ? 'Concerns' : 'Preocupaciones'}
                  choices={SKIN_CONCERNS.map((value) => [value, LABELS.concerns[value][isEnglish ? 1 : 0]] as const)}
                  selected={concerns}
                  onToggle={(value) => toggleChoice(concerns, setConcerns, value)}
                />
                <ChoiceGroup
                  title={isEnglish ? 'Goals' : 'Objetivos'}
                  choices={SKIN_GOALS.map((value) => [value, LABELS.goals[value][isEnglish ? 1 : 0]] as const)}
                  selected={goals}
                  onToggle={(value) => toggleChoice(goals, setGoals, value)}
                />
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                <Button type="submit" disabled={busy || !privacyConsent}>
                  {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {isEnglish ? 'See recommendations' : 'Ver recomendaciones'}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            )}

            <p className="text-xs leading-relaxed text-muted-foreground">{isEnglish ? DISCLAIMER_EN : DISCLAIMER}</p>
          </div>
        </div>
      )}
    </section>
  )
}

function ChoiceGroup({
  title,
  choices,
  selected,
  onToggle,
}: {
  title: string
  choices: readonly (readonly [string, string])[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{title}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {choices.map(([value, label]) => (
          <label key={value} className="flex min-h-10 items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-sm">
            <Checkbox checked={selected.includes(value)} onCheckedChange={() => onToggle(value)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}