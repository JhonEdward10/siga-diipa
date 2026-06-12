import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xuaqrzjgkuvfvnttvakr.supabase.co'
const supabaseAnonKey = 'sb_publishable_-2ZZ7pk9pKDoBPXhuLIhEA_ldWsmBri'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);