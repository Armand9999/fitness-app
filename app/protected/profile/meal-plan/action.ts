'use server'

import { createClient } from "@/utils/supabase/server"
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_APP_OPENAI_API_KEY,
});


export async function regenerateMealPlan() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');
    
    const today = new Date().toISOString().split('T')[0]
    
    // Delete existing meal plan for today
    const { error: deleteError } = await supabase
        .from('meal_plans')
        .delete()
        .eq('user_id', user.id)
        .eq('date', today)

    // Handle potential deletion error
    if (deleteError) {
        console.error('Error deleting existing meal plan:', deleteError)
        throw new Error('Failed to reset meal plan')
    }
  
    // Generate new meal plan
    return getMeal()
}

export async function getMeal() {

    
    const dummyMeals = {
        breakfast: ['Oats with banana and peanut butter' ],
        lunch: ['Grilled chicken with rice and veggies'],
        dinner: ['Salmon with quinoa and asparagus'],
        snacks: ['Greek yogurt', 'Almonds']
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Not logged in');
    }

    const today = new Date().toISOString().split('T')[0]
    
    try {
        let { data: meal_plans, error } = await supabase
            .from('meal_plans')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()
        
        if (!meal_plans) {
            // No plan today — generate one
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
                
            if (profileError) {
                throw new Error('Error fetching profile');
            }
            
            const { data: tde_estimates, error: tdeError } = await supabase
                .from('tde_estimates')
                .select('*')
                .eq('user_id', user.id)
                .order('id', { ascending: false })
                .limit(1)
                .single()
                
            if (tdeError) {
                
                throw new Error('Error fetching TDE data');
            }
            
            const tdeeValue = tde_estimates?.tde_value || null;
            const userGoal = profile?.goal || 'stay_fit';

            const prompt = `Create a personalized one-day meal plan based on the following profile:

User Profile:
- Goal: ${profile?.goal}
- Gender: ${profile?.gender}
- Weight: ${profile?.weight_kg} kg
- Height: ${profile?.height_cm} cm
- Activity Level: ${profile?.activity_level}
- TDEE: ${tdeeValue} calories

Return ONLY a valid JSON object with this exact structure:
{
  "Meals": {
    "Breakfast": "specific meal with portions",
    "Lunch": "specific meal with portions",
    "Dinner": "specific meal with portions",
    "Snacks": "specific snacks with portions"
  }
}

Ensure meals are balanced, realistic, and align with the user's fitness goal and caloric needs.`

            const response = await openai.chat.completions.create({
                model: "gpt-4.1",
                messages : [
                    {
                        role: "system",
                        content: prompt
                    }
                ],
                
                response_format: {
                    "type": "text"
                },
                temperature: 1,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            });    
            const calories_target = userGoal === 'lose_weight' ? tdeeValue - 500 :
                                    userGoal === 'build_muscle' ? tdeeValue + 300 : tdeeValue;

            console.log(response.choices[0].message.content)

            const { data: newMealPlan, error: insertError } = await supabase
                .from('meal_plans')
                .insert({ 
                    user_id: user.id, 
                    date: today, 
                    goal: userGoal, 
                    calories_target: calories_target, 
                    meals: response.choices[0].message.content 
                })
                .select()
                .single()
                
            if (insertError) {
                throw new Error('Error creating meal plan');
            }
            
            return newMealPlan;
        }
        
        if (error) {
            throw new Error('Error fetching meal plan');
        }
        
        return meal_plans;
    } catch (err) {
        console.error('Meal plan error:', err);
        throw err;
    }
}