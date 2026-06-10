'use server'

import { type ProfileFieldErrors } from '@/app/lib/profile-options'
import { ProfileSchema } from '@/app/lib/profile'
import { calculateTDE } from '@/app/lib/tde'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export type ProfileActionResult =
  | { success: false; message: string; fieldErrors?: ProfileFieldErrors }
  | { success: true }

export async function createProfile(formData: FormData): Promise<ProfileActionResult> {
  const parsedProfile = ProfileSchema.safeParse({
    age: formData.get('age'),
    weight_kg: formData.get('weight_kg'),
    height_cm: formData.get('height_cm'),
    gender: formData.get('gender'),
    activity_level: formData.get('activity_level'),
    goal: formData.get('goal'),
  })

  if (!parsedProfile.success) {
    return {
      success: false,
      message: 'Review the highlighted profile fields and try again.',
      fieldErrors: parsedProfile.error.flatten().fieldErrors,
    }
  }

  const profile = parsedProfile.data
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, message: 'You must be signed in to update your profile.' }
  }

  const tde = calculateTDE({
    weightKg: profile.weight_kg,
    heightCm: profile.height_cm,
    age: profile.age,
    gender: profile.gender,
    activityLevel: profile.activity_level,
  })

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...profile })

  if (profileError) {
    console.error('Failed to save profile:', profileError.message)
    return { success: false, message: 'We could not save your profile. Please try again.' }
  }

  // These writes should become one database transaction when migrations are introduced.
  const { error: tdeError } = await supabase
    .from('tde_estimates')
    .insert({ user_id: user.id, tde_value: tde, method: 'Mifflin-St Jeor' })

  if (tdeError) {
    console.error('Failed to save TDEE estimate:', tdeError.message)
    return { success: false, message: 'Your profile was saved, but its TDEE estimate could not be recorded.' }
  }

  redirect('/protected')
}
