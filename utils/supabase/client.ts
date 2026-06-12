import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/app/lib/database.types'

import type { Database } from '@/app/lib/database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Check .env file.'
    )
  }
  
  // @supabase/ssr 0.6.x uses the previous SupabaseClient generic signature.
  // Cast at this compatibility boundary so newer supabase-js releases retain
  // the generated Database contract instead of resolving table rows to never.
  return createBrowserClient(supabaseUrl, supabaseKey) as SupabaseClient<Database>
}
