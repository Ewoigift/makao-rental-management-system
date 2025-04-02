export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          clerk_id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          role: "tenant" | "landlord" | "admin";
          phone: string | null;
          created_at: string;
          updated_at: string | null;
          profile_image_url: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string | null;
          is_active: boolean;
          last_login: string | null;
        };
        Insert: {
          id?: number;
          clerk_id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          role: "tenant" | "landlord" | "admin";
          phone?: string | null;
          created_at?: string;
          updated_at?: string | null;
          profile_image_url?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          is_active?: boolean;
          last_login?: string | null;
        };
        Update: {
          id?: number;
          clerk_id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          role?: "tenant" | "landlord" | "admin";
          phone?: string | null;
          created_at?: string;
          updated_at?: string | null;
          profile_image_url?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          is_active?: boolean;
          last_login?: string | null;
        };
      };
      properties: {
        Row: {
          id: number;
          landlord_id: number;
          name: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          country: string;
          property_type: string;
          bedrooms: number | null;
          bathrooms: number | null;
          square_feet: number | null;
          rent_amount: number;
          deposit_amount: number;
          is_available: boolean;
          description: string | null;
          created_at: string;
          updated_at: string | null;
          images: string[] | null;
          amenities: string[] | null;
        };
        Insert: {
          id?: number;
          landlord_id: number;
          name: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          country: string;
          property_type: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          rent_amount: number;
          deposit_amount: number;
          is_available?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
          images?: string[] | null;
          amenities?: string[] | null;
        };
        Update: {
          id?: number;
          landlord_id?: number;
          name?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          country?: string;
          property_type?: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          rent_amount?: number;
          deposit_amount?: number;
          is_available?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
          images?: string[] | null;
          amenities?: string[] | null;
        };
      };
      leases: {
        Row: {
          id: number;
          property_id: number;
          tenant_id: number;
          start_date: string;
          end_date: string;
          rent_amount: number;
          deposit_amount: number;
          lease_status: "active" | "pending" | "expired" | "terminated";
          created_at: string;
          updated_at: string | null;
          document_url: string | null;
          payment_due_day: number;
          lease_terms: string | null;
        };
        Insert: {
          id?: number;
          property_id: number;
          tenant_id: number;
          start_date: string;
          end_date: string;
          rent_amount: number;
          deposit_amount: number;
          lease_status?: "active" | "pending" | "expired" | "terminated";
          created_at?: string;
          updated_at?: string | null;
          document_url?: string | null;
          payment_due_day: number;
          lease_terms?: string | null;
        };
        Update: {
          id?: number;
          property_id?: number;
          tenant_id?: number;
          start_date?: string;
          end_date?: string;
          rent_amount?: number;
          deposit_amount?: number;
          lease_status?: "active" | "pending" | "expired" | "terminated";
          created_at?: string;
          updated_at?: string | null;
          document_url?: string | null;
          payment_due_day?: number;
          lease_terms?: string | null;
        };
      };
      payments: {
        Row: {
          id: number;
          lease_id: number;
          tenant_id: number;
          amount: number;
          payment_date: string;
          payment_method: string;
          payment_status: "pending" | "completed" | "failed" | "refunded";
          transaction_id: string | null;
          created_at: string;
          updated_at: string | null;
          payment_type: "rent" | "deposit" | "fee" | "other";
          description: string | null;
          receipt_url: string | null;
        };
        Insert: {
          id?: number;
          lease_id: number;
          tenant_id: number;
          amount: number;
          payment_date: string;
          payment_method: string;
          payment_status?: "pending" | "completed" | "failed" | "refunded";
          transaction_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          payment_type: "rent" | "deposit" | "fee" | "other";
          description?: string | null;
          receipt_url?: string | null;
        };
        Update: {
          id?: number;
          lease_id?: number;
          tenant_id?: number;
          amount?: number;
          payment_date?: string;
          payment_method?: string;
          payment_status?: "pending" | "completed" | "failed" | "refunded";
          transaction_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          payment_type?: "rent" | "deposit" | "fee" | "other";
          description?: string | null;
          receipt_url?: string | null;
        };
      };
      maintenance_requests: {
        Row: {
          id: number;
          property_id: number;
          tenant_id: number;
          title: string;
          description: string;
          status: "pending" | "in_progress" | "completed" | "cancelled";
          priority: "low" | "medium" | "high" | "emergency";
          created_at: string;
          updated_at: string | null;
          completed_at: string | null;
          images: string[] | null;
          assigned_to: number | null;
          notes: string | null;
        };
        Insert: {
          id?: number;
          property_id: number;
          tenant_id: number;
          title: string;
          description: string;
          status?: "pending" | "in_progress" | "completed" | "cancelled";
          priority?: "low" | "medium" | "high" | "emergency";
          created_at?: string;
          updated_at?: string | null;
          completed_at?: string | null;
          images?: string[] | null;
          assigned_to?: number | null;
          notes?: string | null;
        };
        Update: {
          id?: number;
          property_id?: number;
          tenant_id?: number;
          title?: string;
          description?: string;
          status?: "pending" | "in_progress" | "completed" | "cancelled";
          priority?: "low" | "medium" | "high" | "emergency";
          created_at?: string;
          updated_at?: string | null;
          completed_at?: string | null;
          images?: string[] | null;
          assigned_to?: number | null;
          notes?: string | null;
        };
      };
      notifications: {
        Row: {
          id: number;
          user_id: number;
          title: string;
          message: string;
          type: "payment" | "maintenance" | "lease" | "general";
          is_read: boolean;
          created_at: string;
          updated_at: string | null;
          link: string | null;
          sender_id: number | null;
        };
        Insert: {
          id?: number;
          user_id: number;
          title: string;
          message: string;
          type: "payment" | "maintenance" | "lease" | "general";
          is_read?: boolean;
          created_at?: string;
          updated_at?: string | null;
          link?: string | null;
          sender_id?: number | null;
        };
        Update: {
          id?: number;
          user_id?: number;
          title?: string;
          message?: string;
          type?: "payment" | "maintenance" | "lease" | "general";
          is_read?: boolean;
          created_at?: string;
          updated_at?: string | null;
          link?: string | null;
          sender_id?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
