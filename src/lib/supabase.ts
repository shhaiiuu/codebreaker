import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const configured = Boolean(url && key)

export const supabase = createClient(url ?? 'http://localhost', key ?? 'missing', {
  auth: { persistSession: true, autoRefreshToken: true },
})

/** Every visitor gets an anonymous account. It is how the server knows who is who. */
export async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.user
  const { data: created, error } = await supabase.auth.signInAnonymously()
  if (error || !created.user) throw new Error(error?.message ?? 'Could not sign in.')
  return created.user
}
