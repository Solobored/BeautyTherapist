import { createClient } from '@supabase/supabase-js';

// createClient throws if url or key is empty ("supabaseUrl is required"). That breaks
// SSR and the whole app on hosts (e.g. Vercel) before env vars are set. Use placeholders
// so the module loads; queries fail gracefully and hooks fall back to mock data.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || 'placeholder-anon-key';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || 'placeholder-service-role-key';

// Client for browser/frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side operations (API routes)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// TypeScript type generation - these are placeholders for auto-generated types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_type: 'buyer' | 'seller';
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      brands: {
        Row: {
          id: string;
          owner_id: string;
          brand_name: string;
          brand_slug: string;
          description: string | null;
          logo_url: string | null;
          category: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['brands']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['brands']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          brand_id: string;
          name_es: string;
          name_en: string;
          description_es: string | null;
          description_en: string | null;
          ingredients: string | null;
          how_to_use: string | null;
          price: number;
          compare_at_price: number | null;
          stock: number;
          category: string;
          status: 'active' | 'inactive' | 'draft';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          position: number | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['product_images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          street: string;
          city: string;
          state: string | null;
          zip: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          buyer_email: string;
          buyer_name: string;
          buyer_phone: string | null;
          user_id: string | null;
          shipping_address: Record<string, any>;
          items: Record<string, any>[];
          subtotal: number;
          shipping_cost: number;
          discount: number;
          total: number;
          payment_method: string | null;
          payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
          order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          coupon_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_image: string | null;
          price: number;
          quantity: number;
          subtotal: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_order: number | null;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>;
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wishlist']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['wishlist']['Insert']>;
      };
      blog_posts: {
        Row: {
          id: string;
          title_es: string;
          title_en: string;
          slug: string;
          content_es: string;
          content_en: string;
          cover_image: string | null;
          category: string;
          author: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>;
      };
    };
  };
};
