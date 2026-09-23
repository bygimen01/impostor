import {createClient} from '@supabase/supabase-js'
const SupabaseUrl=import.meta.env.VITE_SUPABASE_URL as string|undefined
const SupabaseKey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string|undefined
export const IsOnlineConfigured=Boolean(SupabaseUrl&&SupabaseKey)
export const Supabase=IsOnlineConfigured?createClient(SupabaseUrl!,SupabaseKey!):null
