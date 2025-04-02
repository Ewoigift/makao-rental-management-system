import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

/**
 * Creates a Supabase client authenticated with the current user's Clerk JWT
 * This allows for secure, authenticated access to Supabase resources
 */
export async function getSupabaseClient() {
  // Get Clerk user JWT with Supabase claims
  const { getToken } = auth();
  const supabaseAccessToken = await getToken({ template: 'supabase' });
  
  if (!supabaseAccessToken) {
    throw new Error('No Supabase access token available');
  }
  
  // Create Supabase client with Clerk JWT
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
    }
  );
  
  return supabase;
}

/**
 * Creates a Supabase admin client with service role key
 * IMPORTANT: This should only be used in server contexts, never exposed to the client
 */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
