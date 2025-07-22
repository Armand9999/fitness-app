'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from 'next/cache'
import { redirect } from "next/navigation"



export const SignOut = async () => {
    const supabase = await createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        
        if (user) {
            await supabase.auth.signOut()
        }
        
        revalidatePath('/', 'layout')
        redirect('/login')
    } catch (error) {
        console.error("Error during sign out:", error)

    }
}