'use server'

import { calculateTDE } from "@/app/lib/tde";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createProfile(formData: FormData) {
    const supabase = await createClient();

    const age = formData.get('age') as string;
    const weight_kg = formData.get('weight_kg') as string;
    const height_cm = formData.get('height_cm') as string;
    const gender = formData.get('gender') as string;
    const activity_level = formData.get('activity_level') as string;
    const goal = formData.get('goal') as string;

    // Validate numeric fields
    const ageNum = Number(age);
    const weightNum = Number(weight_kg);
    const heightNum = Number(height_cm);

    if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum)) {
    return { error: "Age, weight, and height must be valid numbers" };
    }

    // Additional validation if needed (e.g., positive values)
    if (ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
    return { error: "Age, weight, and height must be positive values" };
    }
        
    const { data: { user } } = await supabase.auth.getUser();

    if(!user) {
        return { error: "User not found" };
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
                id: user.id,
                age: Number(age),
                weight_kg: Number(weight_kg),
                height_cm: Number(height_cm),
                gender,
                activity_level,
                goal,
            }).select();
    
    if(profileError) {
        return { error: profileError.message };
    }

    
    const tde = calculateTDE(Number(weight_kg), Number(height_cm), Number(age), gender, activity_level);

    const { error: tdeError } = await supabase
        .from('tde_estimates')
        .insert({ user_id: user.id, tde_value: tde, method: 'Mifflin-St Jeor' })
        .select();
    
    if(tdeError) {
        return { error: tdeError.message };
    }

    redirect('/protected');
}
