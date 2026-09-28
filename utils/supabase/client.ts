import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

export const createClient = () =>
  createBrowserClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-anon-key')
