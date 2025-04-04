import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { auth } from '@clerk/nextjs';

// Create a Supabase client for client-side operations
export const createSupabaseClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Create a Supabase admin client for server-side operations
export const createSupabaseAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Function to get user data from Supabase using Clerk ID
export async function getUserByClerkId(clerkId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    
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
  } catch (error) {
    console.error('Error in getUserByClerkId:', error);
    return null;
  }
}

// Function to create or update user in Supabase after Clerk authentication
export async function syncUserWithSupabase(clerkUser: any) {
  try {
    if (!clerkUser?.id) {
      console.error('No valid Clerk user provided');
      return null;
    }

    const supabase = createSupabaseAdminClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUser.id)
      .single();

    const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
    const primaryPhone = clerkUser.phoneNumbers?.[0]?.phoneNumber;

    const userData = {
      clerk_id: clerkUser.id,
      email: primaryEmail,
      first_name: clerkUser.firstName || '',
      last_name: clerkUser.lastName || '',
      phone: primaryPhone || null,
      profile_image_url: clerkUser.imageUrl || null,
      updated_at: new Date().toISOString()
    };

    let result;

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

      result = data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          is_active: true,
          role: null // Will be set during role selection
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return null;
      }

      result = data;
    }

    return result;
  } catch (error) {
    console.error('Error in syncUserWithSupabase:', error);
    return null;
  }
}

// Function to update user role
export async function updateUserRole(clerkId: string, role: 'tenant' | 'landlord') {
  try {
    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return null;
  }
}

// Function to get user role
export async function getUserRole(clerkId: string) {
  try {
    const user = await getUserByClerkId(clerkId);
    return user?.role || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}
