'use server'

import { createClient } from "../../utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { SignUpSchema, FormState } from "../lib/definitions"

export async function signup(state: FormState, formData: FormData) {
    const supabase = await createClient();

    const validatedFields = SignUpSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        // confirmPassword: formData.get('confirmPassword'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { data, error } = await supabase.auth.signUp({
        email: validatedFields.data.email,
        password: validatedFields.data.password,
        options: {
            data: {
                name: validatedFields.data.name,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        },
    })

    if(error) {
        console.log('Authentication error:', {
        code: error.code,
        message: error.message,
        status: error.status
        })

        redirect( `/error`)
    }

    // Check if the user needs to confirm their email
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
        // User already exists but hasn't verified their email
        return {
            errors: {
                email: ["This email is already registered but not verified. Please check your inbox."]
            }
        }
    }
    
    // Redirect to verification page instead of home
   
    redirect('/verification');
    
}