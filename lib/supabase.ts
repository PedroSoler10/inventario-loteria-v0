import { createClient } from '@supabase/supabase-js'

function supabaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  return raw.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '')
}

function supabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  )
}

export const supabase = createClient(supabaseUrl(), supabaseAnonKey())
