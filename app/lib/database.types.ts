// Generated-compatible Supabase database contract. Refresh after every schema migration.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ExerciseJson = {
  name: string
  sets?: number
  reps?: string
  duration?: string
  instructions: string
  rest?: string
}

export type MealPlanJson = string | { [key: string]: Json | undefined }

type UserRelationship = {
  foreignKeyName: string
  columns: ['user_id']
  isOneToOne: false
  referencedRelation: 'users'
  referencedColumns: ['id']
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          age: number
          weight_kg: number
          height_cm: number
          gender: 'male' | 'female'
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
          goal: 'lose_weight' | 'build_muscle' | 'stay_fit'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          age: number
          weight_kg: number
          height_cm: number
          gender: 'male' | 'female'
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
          goal: 'lose_weight' | 'build_muscle' | 'stay_fit'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      tde_estimates: {
        Row: { id: number; user_id: string; tde_value: number; method: 'Mifflin-St Jeor'; created_at: string }
        Insert: { id?: number; user_id: string; tde_value: number; method: 'Mifflin-St Jeor'; created_at?: string }
        Update: Partial<Database['public']['Tables']['tde_estimates']['Insert']>
        Relationships: [UserRelationship]
      }
      water_intake: {
        Row: { id: number; user_id: string; date: string; glasses_consumed: number; goal: number; created_at: string; updated_at: string }
        Insert: { id?: number; user_id: string; date: string; glasses_consumed?: number; goal?: number; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['water_intake']['Insert']>
        Relationships: [UserRelationship]
      }
      workout_plans: {
        Row: { id: number; user_id: string; date: string; workout_type: 'cardio' | 'strength' | 'full_body' | 'flexibility'; duration_minutes: number; difficulty: 'beginner' | 'intermediate' | 'advanced'; exercises: ExerciseJson[]; created_at: string; updated_at: string }
        Insert: { id?: number; user_id: string; date: string; workout_type: 'cardio' | 'strength' | 'full_body' | 'flexibility'; duration_minutes: number; difficulty: 'beginner' | 'intermediate' | 'advanced'; exercises: ExerciseJson[]; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['workout_plans']['Insert']>
        Relationships: [UserRelationship]
      }
      workout_sessions: {
        Row: { id: number; user_id: string; workout_name: string; duration_minutes: number; exercises: ExerciseJson[]; completed_at: string; created_at: string }
        Insert: { id?: number; user_id: string; workout_name: string; duration_minutes: number; exercises: ExerciseJson[]; completed_at?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['workout_sessions']['Insert']>
        Relationships: [UserRelationship]
      }
      meal_plans: {
        Row: { id: number; user_id: string; date: string; goal: 'lose_weight' | 'build_muscle' | 'stay_fit'; calories_target: number; meals: MealPlanJson; created_at: string; updated_at: string }
        Insert: { id?: number; user_id: string; date: string; goal: 'lose_weight' | 'build_muscle' | 'stay_fit'; calories_target: number; meals: MealPlanJson; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['meal_plans']['Insert']>
        Relationships: [UserRelationship]
      }
    }
    Views: Record<string, never>
    Functions: {
      save_profile_with_tde: {
        Args: {
          profile_age: number
          profile_weight_kg: number
          profile_height_cm: number
          profile_gender: 'male' | 'female'
          profile_activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
          profile_goal: 'lose_weight' | 'build_muscle' | 'stay_fit'
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
