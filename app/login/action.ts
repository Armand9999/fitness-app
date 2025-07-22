'use server'

import { redirect } from 'next/navigation'

import { createClient } from '../../utils/supabase/server'
import { FormState, LoginSchema } from '../lib/definitions'


export async function login(formState: FormState, formData: FormData) {

    const validatedFields = LoginSchema.safeParse({
        email: formData.get('email') as string,
        password: formData.get('password') as string
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    // Create a Supabase client
    const supabase = await createClient()
    // Authenticate the user
    const { error } = await supabase.auth.signInWithPassword(validatedFields.data)

    if (error) {
        
        console.log('Authentication error:', {
            code: error.code,
            message: error.message,
            status: error.status
        })

        
        // Handle email not confirmed error specifically
        if (error.code === 'email_not_confirmed') {
            // Resend verification email
            await supabase.auth.resend({
                type: 'signup',
                email: validatedFields.data.email,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
                }
            })
            redirect('/verification')
        }
        
        // redirect('/error')
        return {
            errors: {
                email: ["Incorrect email or password"],
                password: ["Incorrect email or password"]
            }
        }
    }

    // revalidatePath('/', 'layout')
    redirect(`/protected`)
}