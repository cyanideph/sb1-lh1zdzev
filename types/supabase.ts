export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chatrooms: {
        Row: {
          id: string
          created_at: string
          name: string
          region: string
          province: string
          description: string | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          region: string
          province: string
          description?: string | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          region?: string
          province?: string
          description?: string | null
          created_by?: string
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          content: string
          user_id: string
          chatroom_id: string
          type: 'text' | 'image'
          image_url?: string
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          user_id: string
          chatroom_id: string
          type?: 'text' | 'image'
          image_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          user_id?: string
          chatroom_id?: string
          type?: 'text' | 'image'
          image_url?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          is_online: boolean
          last_seen: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          is_online?: boolean
          last_seen?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          is_online?: boolean
          last_seen?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}