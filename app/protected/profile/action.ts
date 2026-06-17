'use server'

import { type ProfileFieldErrors } from '@/app/lib/profile-options'
import { logError } from '@/app/lib/logger'
import { ProfileSchema } from '@/app/lib/profile'
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

  const { error: saveError } = await supabase.rpc('save_profile_with_tde', {
    profile_age: profile.age,
    profile_weight_kg: profile.weight_kg,
    profile_height_cm: profile.height_cm,
    profile_gender: profile.gender,
    profile_activity_level: profile.activity_level,
    profile_goal: profile.goal,
  })

  if (saveError) {
    logError('profile.save_with_tde.failed', saveError, { userPresent: Boolean(user.id) })
    return { success: false, message: 'We could not save your profile. Please try again.' }
  }

  redirect('/protected')
}
