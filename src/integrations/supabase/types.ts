export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievement_types: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      admin_program_exercises: {
        Row: {
          created_at: string
          day_of_week: number
          exercise_id: number
          id: string
          notes: string | null
          order_in_day: number
          program_id: string
          reps_max: number | null
          reps_min: number | null
          rest_seconds: number | null
          sets: number | null
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          exercise_id: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number | null
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          exercise_id?: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id?: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_exercises_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_routines: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          notes: string | null
          order_in_day: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id?: string
          routine_id?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_weeks: {
        Row: {
          created_at: string
          focus_areas: string[] | null
          id: string
          program_id: string
          week_description: string | null
          week_name: string | null
          week_number: number
        }
        Insert: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          program_id: string
          week_description?: string | null
          week_name?: string | null
          week_number: number
        }
        Update: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          program_id?: string
          week_description?: string | null
          week_name?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_programs: {
        Row: {
          created_at: string
          created_by_admin: string | null
          description: string | null
          difficulty_level: string
          duration_weeks: number
          estimated_sessions_per_week: number | null
          id: string
          is_active: boolean
          name: string
          program_type: string
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level: string
          duration_weeks?: number
          estimated_sessions_per_week?: number | null
          id?: string
          is_active?: boolean
          name: string
          program_type?: string
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level?: string
          duration_weeks?: number
          estimated_sessions_per_week?: number | null
          id?: string
          is_active?: boolean
          name?: string
          program_type?: string
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_program_week_routines: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          order_in_day: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          order_in_day?: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          order_in_day?: number
          program_id?: string
          routine_id?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "advanced_program_week_routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "weekly_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advanced_program_week_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_program_weeks: {
        Row: {
          created_at: string
          id: string
          program_id: string
          week_description: string | null
          week_name: string | null
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          program_id: string
          week_description?: string | null
          week_name?: string | null
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          program_id?: string
          week_description?: string | null
          week_name?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "advanced_program_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "weekly_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          last_attempt_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          last_attempt_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          last_attempt_at?: string | null
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          abdomen_circumference_cm: number | null
          arm_circumference_cm: number | null
          body_fat_percentage: number | null
          chest_circumference_cm: number | null
          created_at: string | null
          height_cm: number | null
          id: number
          leg_circumference_cm: number | null
          measurement_date: string | null
          notes: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string | null
          height_cm?: number | null
          id?: number
          leg_circumference_cm?: number | null
          measurement_date?: string | null
          notes?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string | null
          height_cm?: number | null
          id?: number
          leg_circumference_cm?: number | null
          measurement_date?: string | null
          notes?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      body_measurements_history: {
        Row: {
          abdomen_circumference_cm: number | null
          arm_circumference_cm: number | null
          body_fat_percentage: number | null
          chest_circumference_cm: number | null
          created_at: string
          height_cm: number | null
          id: string
          leg_circumference_cm: number | null
          measured_at: string
          notes: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          leg_circumference_cm?: number | null
          measured_at?: string
          notes?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          leg_circumference_cm?: number | null
          measured_at?: string
          notes?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          country_id: number
          id: number
          name: string
        }
        Insert: {
          country_id: number
          id?: never
          name: string
        }
        Update: {
          country_id?: number
          id?: never
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          id: number
          name: string
        }
        Insert: {
          code: string
          id?: never
          name: string
        }
        Update: {
          code?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      daily_food_log_entries: {
        Row: {
          calories_consumed: number
          carbs_g_consumed: number
          custom_food_name: string | null
          fat_g_consumed: number
          food_item_id: number | null
          health_score: number | null
          id: number
          ingredients: Json | null
          log_date: string
          logged_at: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes: string | null
          photo_url: string | null
          protein_g_consumed: number
          quantity_consumed: number
          unit_consumed: string | null
          user_id: string
        }
        Insert: {
          calories_consumed: number
          carbs_g_consumed: number
          custom_food_name?: string | null
          fat_g_consumed: number
          food_item_id?: number | null
          health_score?: number | null
          id?: number
          ingredients?: Json | null
          log_date?: string
          logged_at?: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          photo_url?: string | null
          protein_g_consumed: number
          quantity_consumed: number
          unit_consumed?: string | null
          user_id: string
        }
        Update: {
          calories_consumed?: number
          carbs_g_consumed?: number
          custom_food_name?: string | null
          fat_g_consumed?: number
          food_item_id?: number | null
          health_score?: number | null
          id?: number
          ingredients?: Json | null
          log_date?: string
          logged_at?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          photo_url?: string | null
          protein_g_consumed?: number
          quantity_consumed?: number
          unit_consumed?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_food_log_entries_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_food_log_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_food_log_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      diet_types: {
        Row: {
          description: string | null
          icon_name: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          icon_name?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          icon_name?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_by_user_id: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          equipment_required: string | null
          id: number
          image_url: string | null
          muscle_group_main: string | null
          name: string
          thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          created_by_user_id?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          equipment_required?: string | null
          id?: number
          image_url?: string | null
          muscle_group_main?: string | null
          name: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          created_by_user_id?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          equipment_required?: string | null
          id?: number
          image_url?: string | null
          muscle_group_main?: string | null
          name?: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      food_items: {
        Row: {
          barcode: string | null
          brand_name: string | null
          calories_per_serving: number
          carbs_g_per_serving: number
          fat_g_per_serving: number
          id: number
          is_verified_by_admin: boolean
          name: string
          protein_g_per_serving: number
          serving_size_grams: number | null
          serving_size_unit: string | null
          user_contributed_id: string | null
        }
        Insert: {
          barcode?: string | null
          brand_name?: string | null
          calories_per_serving: number
          carbs_g_per_serving: number
          fat_g_per_serving: number
          id?: number
          is_verified_by_admin?: boolean
          name: string
          protein_g_per_serving: number
          serving_size_grams?: number | null
          serving_size_unit?: string | null
          user_contributed_id?: string | null
        }
        Update: {
          barcode?: string | null
          brand_name?: string | null
          calories_per_serving?: number
          carbs_g_per_serving?: number
          fat_g_per_serving?: number
          id?: number
          is_verified_by_admin?: boolean
          name?: string
          protein_g_per_serving?: number
          serving_size_grams?: number | null
          serving_size_unit?: string | null
          user_contributed_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_items_user_contributed_id_fkey"
            columns: ["user_contributed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_items_user_contributed_id_fkey"
            columns: ["user_contributed_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gatofit_program_exercises: {
        Row: {
          created_at: string
          day_of_week: number
          exercise_id: number
          id: string
          notes: string | null
          order_in_day: number
          program_id: string
          reps_max: number | null
          reps_min: number | null
          rest_seconds: number | null
          sets: number | null
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          exercise_id: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number | null
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          exercise_id?: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id?: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatofit_program_exercises_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_program_routines: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          notes: string | null
          order_in_day: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id?: string
          routine_id?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatofit_program_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_program_weeks: {
        Row: {
          created_at: string
          focus_areas: string[] | null
          id: string
          program_id: string
          week_description: string | null
          week_name: string | null
          week_number: number
        }
        Insert: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          program_id: string
          week_description?: string | null
          week_name?: string | null
          week_number: number
        }
        Update: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          program_id?: string
          week_description?: string | null
          week_name?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_programs: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by_admin: string | null
          description: string | null
          difficulty_level: string
          duration_weeks: number
          estimated_sessions_per_week: number | null
          id: string
          is_active: boolean
          name: string
          program_type: string
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level: string
          duration_weeks?: number
          estimated_sessions_per_week?: number | null
          id?: string
          is_active?: boolean
          name: string
          program_type?: string
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level?: string
          duration_weeks?: number
          estimated_sessions_per_week?: number | null
          id?: string
          is_active?: boolean
          name?: string
          program_type?: string
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      obstacle_types: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          abdomen_circumference_cm: number | null
          arm_circumference_cm: number | null
          avatar_url: string | null
          bio: string | null
          body_fat_percentage: number | null
          chest_circumference_cm: number | null
          created_at: string
          current_weight_kg: number | null
          date_of_birth: string | null
          diet_id: number | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          height_cm: number | null
          id: string
          initial_recommended_calories: number | null
          initial_recommended_carbs_g: number | null
          initial_recommended_fats_g: number | null
          initial_recommended_protein_g: number | null
          initial_weight_kg: number | null
          is_profile_public: boolean | null
          leg_circumference_cm: number | null
          main_goal: Database["public"]["Enums"]["goal_type"] | null
          previous_app_experience: boolean | null
          target_kg_per_week: number | null
          target_pace: Database["public"]["Enums"]["pace_type"] | null
          target_weight_kg: number | null
          timezone_name: string | null
          timezone_offset: number | null
          total_workouts: number | null
          trainings_per_week: number | null
          unit_system_preference:
            | Database["public"]["Enums"]["unit_system"]
            | null
          updated_at: string
          username: string | null
        }
        Insert: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          avatar_url?: string | null
          bio?: string | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string
          current_weight_kg?: number | null
          date_of_birth?: string | null
          diet_id?: number | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          height_cm?: number | null
          id: string
          initial_recommended_calories?: number | null
          initial_recommended_carbs_g?: number | null
          initial_recommended_fats_g?: number | null
          initial_recommended_protein_g?: number | null
          initial_weight_kg?: number | null
          is_profile_public?: boolean | null
          leg_circumference_cm?: number | null
          main_goal?: Database["public"]["Enums"]["goal_type"] | null
          previous_app_experience?: boolean | null
          target_kg_per_week?: number | null
          target_pace?: Database["public"]["Enums"]["pace_type"] | null
          target_weight_kg?: number | null
          timezone_name?: string | null
          timezone_offset?: number | null
          total_workouts?: number | null
          trainings_per_week?: number | null
          unit_system_preference?:
            | Database["public"]["Enums"]["unit_system"]
            | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          avatar_url?: string | null
          bio?: string | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string
          current_weight_kg?: number | null
          date_of_birth?: string | null
          diet_id?: number | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          height_cm?: number | null
          id?: string
          initial_recommended_calories?: number | null
          initial_recommended_carbs_g?: number | null
          initial_recommended_fats_g?: number | null
          initial_recommended_protein_g?: number | null
          initial_weight_kg?: number | null
          is_profile_public?: boolean | null
          leg_circumference_cm?: number | null
          main_goal?: Database["public"]["Enums"]["goal_type"] | null
          previous_app_experience?: boolean | null
          target_kg_per_week?: number | null
          target_pace?: Database["public"]["Enums"]["pace_type"] | null
          target_weight_kg?: number | null
          timezone_name?: string | null
          timezone_offset?: number | null
          total_workouts?: number | null
          trainings_per_week?: number | null
          unit_system_preference?:
            | Database["public"]["Enums"]["unit_system"]
            | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          block_name: string | null
          duration_seconds: number | null
          exercise_id: number
          exercise_order: number
          id: number
          notes: string | null
          reps_max: number | null
          reps_min: number | null
          rest_between_sets_seconds: number | null
          routine_id: number
          sets: number | null
        }
        Insert: {
          block_name?: string | null
          duration_seconds?: number | null
          exercise_id: number
          exercise_order: number
          id?: number
          notes?: string | null
          reps_max?: number | null
          reps_min?: number | null
          rest_between_sets_seconds?: number | null
          routine_id: number
          sets?: number | null
        }
        Update: {
          block_name?: string | null
          duration_seconds?: number | null
          exercise_id?: number
          exercise_order?: number
          id?: number
          notes?: string | null
          reps_max?: number | null
          reps_min?: number | null
          rest_between_sets_seconds?: number | null
          routine_id?: number
          sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          id: number
          is_predefined: boolean
          name: string
          type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: number
          is_predefined?: boolean
          name: string
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: number
          is_predefined?: boolean
          name?: string
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shared_routines: {
        Row: {
          downloads_count: number | null
          id: number
          is_public: boolean | null
          routine_id: number
          shared_at: string | null
          user_id: string
        }
        Insert: {
          downloads_count?: number | null
          id?: number
          is_public?: boolean | null
          routine_id: number
          shared_at?: string | null
          user_id: string
        }
        Update: {
          downloads_count?: number | null
          id?: number
          is_public?: boolean | null
          routine_id?: number
          shared_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: true
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price_usd: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price_usd: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          price_usd?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_limits: {
        Row: {
          ai_chat_messages_used: number | null
          created_at: string | null
          id: string
          nutrition_photos_used: number | null
          routines_created: number | null
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          ai_chat_messages_used?: number | null
          created_at?: string | null
          id?: string
          nutrition_photos_used?: number | null
          routines_created?: number | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          ai_chat_messages_used?: number | null
          created_at?: string | null
          id?: string
          nutrition_photos_used?: number | null
          routines_created?: number | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_type_id: number
          created_at: string
          user_id: string
        }
        Insert: {
          achievement_type_id: number
          created_at?: string
          user_id: string
        }
        Update: {
          achievement_type_id?: number
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_type_id_fkey"
            columns: ["achievement_type_id"]
            isOneToOne: false
            referencedRelation: "achievement_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_assigned_programs: {
        Row: {
          assigned_at: string
          assigned_by_admin: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          current_day: number
          current_week: number
          id: string
          is_active: boolean
          last_activity_date: string | null
          notes: string | null
          program_id: string
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by_admin?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_day?: number
          current_week?: number
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          notes?: string | null
          program_id: string
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by_admin?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_day?: number
          current_week?: number
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          notes?: string | null
          program_id?: string
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_assigned_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_macro_targets: {
        Row: {
          calories_target: number
          carbs_g_target: number
          fat_g_target: number
          id: number
          protein_g_target: number
          target_date_start: string
          user_id: string
        }
        Insert: {
          calories_target: number
          carbs_g_target: number
          fat_g_target: number
          id?: number
          protein_g_target: number
          target_date_start?: string
          user_id: string
        }
        Update: {
          calories_target?: number
          carbs_g_target?: number
          fat_g_target?: number
          id?: number
          protein_g_target?: number
          target_date_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_macro_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_macro_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: number
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: number
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_gatofit_program_progress: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          current_day: number
          current_week: number
          id: string
          is_active: boolean
          last_workout_date: string | null
          program_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_day?: number
          current_week?: number
          id?: string
          is_active?: boolean
          last_workout_date?: string | null
          program_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_day?: number
          current_week?: number
          id?: string
          is_active?: boolean
          last_workout_date?: string | null
          program_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gatofit_program_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_obstacles: {
        Row: {
          created_at: string
          obstacle_type_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          obstacle_type_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          obstacle_type_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_obstacles_obstacle_type_id_fkey"
            columns: ["obstacle_type_id"]
            isOneToOne: false
            referencedRelation: "obstacle_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_obstacles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_obstacles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          experience_today: number
          foods_today: number
          id: number
          last_activity_date: string | null
          last_xp_date: string | null
          total_experience: number
          total_points: number
          updated_at: string
          user_id: string
          workouts_today: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          experience_today?: number
          foods_today?: number
          id?: number
          last_activity_date?: string | null
          last_xp_date?: string | null
          total_experience?: number
          total_points?: number
          updated_at?: string
          user_id: string
          workouts_today?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          experience_today?: number
          foods_today?: number
          id?: number
          last_activity_date?: string | null
          last_xp_date?: string | null
          total_experience?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          workouts_today?: number
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renewal: boolean | null
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          next_plan_starts_at: string | null
          next_plan_type:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          scheduled_change_created_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          store_platform: string | null
          store_transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renewal?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          next_plan_starts_at?: string | null
          next_plan_type?:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          scheduled_change_created_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          store_platform?: string | null
          store_transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renewal?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          next_plan_starts_at?: string | null
          next_plan_type?:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          scheduled_change_created_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          store_platform?: string | null
          store_transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_program_routines: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          order_in_day: number
          program_id: string
          routine_id: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          order_in_day?: number
          program_id: string
          routine_id: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          order_in_day?: number
          program_id?: string
          routine_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_program_routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "weekly_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_program_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_programs: {
        Row: {
          created_at: string
          current_week: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          program_type: string | null
          start_date: string | null
          total_weeks: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_week?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          program_type?: string | null
          start_date?: string | null
          total_weeks?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_week?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          program_type?: string | null
          start_date?: string | null
          total_weeks?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_log_exercise_details: {
        Row: {
          duration_seconds_completed: number | null
          exercise_id: number
          exercise_name_snapshot: string
          id: number
          notes: string | null
          reps_completed: number | null
          set_number: number
          weight_kg_used: number | null
          workout_log_id: number
        }
        Insert: {
          duration_seconds_completed?: number | null
          exercise_id: number
          exercise_name_snapshot: string
          id?: number
          notes?: string | null
          reps_completed?: number | null
          set_number: number
          weight_kg_used?: number | null
          workout_log_id: number
        }
        Update: {
          duration_seconds_completed?: number | null
          exercise_id?: number
          exercise_name_snapshot?: string
          id?: number
          notes?: string | null
          reps_completed?: number | null
          set_number?: number
          weight_kg_used?: number | null
          workout_log_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_log_exercise_details_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_log_exercise_details_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          calories_burned_estimated: number | null
          duration_completed_minutes: number | null
          id: number
          notes: string | null
          routine_id: number | null
          routine_name_snapshot: string | null
          user_id: string
          workout_date: string
        }
        Insert: {
          calories_burned_estimated?: number | null
          duration_completed_minutes?: number | null
          id?: number
          notes?: string | null
          routine_id?: number | null
          routine_name_snapshot?: string | null
          user_id: string
          workout_date?: string
        }
        Update: {
          calories_burned_estimated?: number | null
          duration_completed_minutes?: number | null
          id?: number
          notes?: string | null
          routine_id?: number | null
          routine_name_snapshot?: string | null
          user_id?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      user_rankings: {
        Row: {
          avatar_url: string | null
          current_level: number | null
          current_streak: number | null
          followers_count: number | null
          following_count: number | null
          rank_name: string | null
          total_experience: number | null
          total_workouts: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_admin_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_role?: Database["public"]["Enums"]["admin_role"]
        }
        Returns: Json
      }
      calculate_macro_recommendations: {
        Args: {
          user_age: number
          user_gender: string
          user_goal: string
          user_height_cm: number
          user_target_pace: string
          user_trainings_per_week: number
          user_weight_kg: number
        }
        Returns: Json
      }
      cancel_scheduled_plan_change: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_auth_rate_limit: {
        Args: {
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_user_is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      clean_old_food_entries: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      copy_routine: {
        Args: { source_routine_id: number; target_user_id: string }
        Returns: Json
      }
      create_user_profile: {
        Args: { user_id: string }
        Returns: Json
      }
      ensure_user_subscription: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_role: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_public_routines: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          estimated_duration_minutes: number
          exercise_count: number
          routine_description: string
          routine_id: number
          routine_name: string
          routine_type: string
        }[]
      }
      get_user_activity_calendar: {
        Args: { p_month?: number; p_user_id: string; p_year?: number }
        Returns: Json
      }
      get_user_details: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_growth_by_month: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          new_users: number
          total_users: number
        }[]
      }
      get_user_nutrition_details: {
        Args: { p_date: string; p_user_id: string }
        Returns: Json
      }
      get_user_stats: {
        Args: { target_user_id: string }
        Returns: {
          followers_count: number
          following_count: number
          total_workout_hours: number
          total_workouts: number
        }[]
      }
      get_user_subscription_status: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_weekly_usage: {
        Args: { user_id: string }
        Returns: {
          ai_chat_messages_used: number
          nutrition_photos_used: number
          routines_created: number
          week_start_date: string
        }[]
      }
      get_user_weight_evolution: {
        Args: { p_days_back?: number; p_user_id: string }
        Returns: Json
      }
      get_users_with_filters: {
        Args: {
          p_activity_level?: string
          p_limit?: number
          p_offset?: number
          p_order_by?: string
          p_order_direction?: string
          p_search?: string
          p_subscription_type?: string
        }
        Returns: {
          avatar_url: string
          created_at: string
          current_streak: number
          full_name: string
          id: string
          is_active: boolean
          last_activity: string
          subscription_status: string
          subscription_type: string
          total_workouts: number
          username: string
        }[]
      }
      get_week_start: {
        Args: { input_date?: string }
        Returns: string
      }
      get_workout_session_details: {
        Args: { p_workout_log_id: number }
        Returns: Json
      }
      increment_usage_counter: {
        Args: { counter_type: string; increment_by?: number; p_user_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_premium: {
        Args: { user_id: string }
        Returns: boolean
      }
      process_scheduled_plan_changes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      schedule_plan_change: {
        Args: {
          p_new_plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          p_user_id: string
        }
        Returns: Json
      }
      update_expired_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_streak: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      verify_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      admin_role: "super_admin" | "moderator" | "content_manager"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      goal_type:
        | "gain_muscle"
        | "lose_weight"
        | "maintain_weight"
        | "gain_weight"
        | "improve_health"
        | "increase_strength"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack1" | "snack2"
      pace_type: "sloth" | "rabbit" | "leopard"
      subscription_plan_type: "free" | "monthly" | "yearly"
      subscription_status:
        | "active"
        | "expired"
        | "cancelled"
        | "pending"
        | "trial"
      unit_system: "metric" | "imperial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "moderator", "content_manager"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      goal_type: [
        "gain_muscle",
        "lose_weight",
        "maintain_weight",
        "gain_weight",
        "improve_health",
        "increase_strength",
      ],
      meal_type: ["breakfast", "lunch", "dinner", "snack1", "snack2"],
      pace_type: ["sloth", "rabbit", "leopard"],
      subscription_plan_type: ["free", "monthly", "yearly"],
      subscription_status: [
        "active",
        "expired",
        "cancelled",
        "pending",
        "trial",
      ],
      unit_system: ["metric", "imperial"],
    },
  },
} as const
