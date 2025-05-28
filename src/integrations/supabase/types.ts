export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          muscle_group_main: string | null
          name: string
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
          muscle_group_main?: string | null
          name: string
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
          muscle_group_main?: string | null
          name?: string
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
        ]
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
          avatar_url: string | null
          body_fat_percentage: number | null
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
          main_goal: Database["public"]["Enums"]["goal_type"] | null
          previous_app_experience: boolean | null
          target_kg_per_week: number | null
          target_pace: Database["public"]["Enums"]["pace_type"] | null
          target_weight_kg: number | null
          trainings_per_week: number | null
          unit_system_preference:
            | Database["public"]["Enums"]["unit_system"]
            | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          body_fat_percentage?: number | null
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
          main_goal?: Database["public"]["Enums"]["goal_type"] | null
          previous_app_experience?: boolean | null
          target_kg_per_week?: number | null
          target_pace?: Database["public"]["Enums"]["pace_type"] | null
          target_weight_kg?: number | null
          trainings_per_week?: number | null
          unit_system_preference?:
            | Database["public"]["Enums"]["unit_system"]
            | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          body_fat_percentage?: number | null
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
          main_goal?: Database["public"]["Enums"]["goal_type"] | null
          previous_app_experience?: boolean | null
          target_kg_per_week?: number | null
          target_pace?: Database["public"]["Enums"]["pace_type"] | null
          target_weight_kg?: number | null
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
        ]
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
        ]
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_profile: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: Json
      }
    }
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      goal_type: "gain_muscle" | "lose_weight" | "maintain_weight"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack1" | "snack2"
      pace_type: "sloth" | "rabbit" | "leopard"
      unit_system: "metric" | "imperial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      difficulty_level: ["beginner", "intermediate", "advanced"],
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      goal_type: ["gain_muscle", "lose_weight", "maintain_weight"],
      meal_type: ["breakfast", "lunch", "dinner", "snack1", "snack2"],
      pace_type: ["sloth", "rabbit", "leopard"],
      unit_system: ["metric", "imperial"],
    },
  },
} as const
