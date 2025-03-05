import env from '@/env'
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    env.supabase.url,
    env.supabase.anonKey,
  )
}

export const supabaseClient = createClient();