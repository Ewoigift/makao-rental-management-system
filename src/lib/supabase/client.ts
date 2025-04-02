import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export const createServerSupabaseClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Helper function to get user by Clerk ID
export async function getUserByClerkId(clerkId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) {
    console.error('Error fetching user by Clerk ID:', error);
    return null;
  }

  return data;
}

// Helper function to create or update user in Supabase
export async function syncUserWithClerk(clerkUser: any) {
  if (!clerkUser) return null;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkUser.id)
    .single();

  const userData = {
    clerk_id: clerkUser.id,
    email: clerkUser.emailAddresses?.[0]?.emailAddress,
    first_name: clerkUser.firstName,
    last_name: clerkUser.lastName,
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber,
    profile_image_url: clerkUser.imageUrl,
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  };

  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('clerk_id', clerkUser.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user in Supabase:', error);
      return null;
    }

    return data;
  } else {
    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        role: 'tenant', // Default role, will be updated after selection
        created_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return null;
    }

    return data;
  }
}

// Helper function to get user role
export async function getUserRole(clerkId: string) {
  const user = await getUserByClerkId(clerkId);
  return user?.role || null;
}
