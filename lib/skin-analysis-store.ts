import { supabaseServer } from '@/lib/supabase'
import type { SkinAnalysisSource, SkinType } from '@/types/skin-analysis'

export type SaveSkinAnalysisInput = {
  sessionToken: string
  source: SkinAnalysisSource
  skinType?: SkinType | null
  concerns?: string[]
  goals?: string[]
  notes?: string | null
  reportFileUrl?: string | null
  reportFileType?: 'image' | 'pdf' | null
  reportFilePublicId?: string | null
  aiObservations?: string | null
}

export async function saveSkinAnalysis(input: SaveSkinAnalysisInput) {
  const now = new Date()
  const { data, error } = await supabaseServer
    .from('skin_analyses')
    .upsert(
      {
        session_token: input.sessionToken,
        source: input.source,
        skin_type: input.skinType ?? null,
        concerns: input.concerns ?? [],
        goals: input.goals ?? [],
        notes: input.notes ?? null,
        report_file_url: input.reportFileUrl ?? null,
        report_file_type: input.reportFileType ?? null,
        report_file_public_id: input.reportFilePublicId ?? null,
        ai_observations: input.aiObservations ?? null,
        expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: 'session_token' },
    )
    .select('id')
    .single()

  return { id: data?.id as string | undefined, error }
}