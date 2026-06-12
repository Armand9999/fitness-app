'use server'

import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/app/lib/database.types";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
                    try{
                        cookiesToSet.forEach(({name, value, options}) => 
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        console.error("Error setting cookies")
                    }
                },
            }   
        }
    ) as SupabaseClient<Database>
}
