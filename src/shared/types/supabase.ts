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
      daily_sales: {
        Row: {
          comments: string | null
          created_at: string | null
          created_by: string
          date: string
          id: string
          is_validated: boolean | null
          status: string | null
          store_id: string
          total: number
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          created_by: string
          date: string
          id?: string
          is_validated?: boolean | null
          status?: string | null
          store_id: string
          total?: number
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          created_by?: string
          date?: string
          id?: string
          is_validated?: boolean | null
          status?: string | null
          store_id?: string
          total?: number
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
      }
      employees: {
        Row: {
          created_at: string | null
          first_name: string
          hire_date: string
          id: string
          is_active: boolean | null
          last_name: string
          role: string
          salary: number
          status: string | null
          store_id: string
          updated_at: string | null
          work_days: number[]
        }
        Insert: {
          created_at?: string | null
          first_name: string
          hire_date: string
          id?: string
          is_active?: boolean | null
          last_name: string
          role: string
          salary: number
          status?: string | null
          store_id: string
          updated_at?: string | null
          work_days?: number[]
        }
        Update: {
          created_at?: string | null
          first_name?: string
          hire_date?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          role?: string
          salary?: number
          status?: string | null
          store_id?: string
          updated_at?: string | null
          work_days?: number[]
        }
      }
      price_history: {
        Row: {
          created_at: string | null
          id: string
          price: number
          product_id: string
          reason: string | null
          updated_by: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          product_id: string
          reason?: string | null
          updated_by: string
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          product_id?: string
          reason?: string | null
          updated_by?: string
        }
      }
      products: {
        Row: {
          allow_decimals: boolean | null
          category: string
          created_at: string | null
          current_price: number
          id: string
          is_active: boolean | null
          name: string
          price_type: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          allow_decimals?: boolean | null
          category: string
          created_at?: string | null
          current_price: number
          id?: string
          is_active?: boolean | null
          name: string
          price_type?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          allow_decimals?: boolean | null
          category?: string
          created_at?: string | null
          current_price?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price_type?: string | null
          unit?: string
          updated_at?: string | null
        }
      }
      salary_adjustments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string
          employee_id: string
          id: string
          month: number
          reason: string
          type: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by: string
          employee_id: string
          id?: string
          month: number
          reason: string
          type: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string
          employee_id?: string
          id?: string
          month?: number
          reason?: string
          type?: string
          year?: number
        }
      }
      sales_entries: {
        Row: {
          created_at: string | null
          daily_sales_id: string
          id: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_sales_id: string
          id?: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_sales_id?: string
          id?: string
          product_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
          updated_at?: string | null
        }
      }
      stores: {
        Row: {
          address: string
          created_at: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          name: string
          phone: string
          type: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name: string
          phone: string
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name?: string
          phone?: string
          type?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      employee_performance: {
        Row: {
          average_daily_revenue: number | null
          employee_id: string | null
          first_name: string | null
          last_name: string | null
          role: string | null
          store_id: string | null
          store_name: string | null
          total_revenue: number | null
          total_sales_days: number | null
        }
      }
      sales_with_products: {
        Row: {
          category: string | null
          created_at: string | null
          daily_sales_id: string | null
          date: string | null
          id: string | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          store_id: string | null
          store_name: string | null
          store_type: string | null
          subtotal: number | null
          unit: string | null
          unit_price: number | null
        }
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']