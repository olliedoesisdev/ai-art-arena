/**
 * Supabase client configured for admin schema access
 * Use this for all admin/blog table operations
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Create a Supabase client with admin schema access
 * This client is configured to query the admin schema by default
 */
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Create client with schema option
  const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    db: {
      schema: 'admin'
    }
  });

  return supabase;
}

/**
 * Helper type for admin schema tables without the admin. prefix
 * Use this when you need to reference admin tables
 */
export type AdminTable =
  | 'users'
  | 'blog_posts'
  | 'blog_categories'
  | 'blog_tags'
  | 'blog_post_tags'
  | 'blog_media'
  | 'blog_post_revisions';
