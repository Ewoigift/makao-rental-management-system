import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { auth } from '@clerk/nextjs';
// Simple UUID generator function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create a Supabase client for client-side operations
export const createSupabaseClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Create a Supabase admin client for server-side operations
export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials:', { 
      url: !!supabaseUrl, 
      key: !!supabaseKey 
    });
    throw new Error('supabaseKey is required');
  }
  
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
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

    // Check if user already exists by clerk_id
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUser.id)
      .single();

    const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
    
    // Default to tenant if no role is set
    const defaultUserType = 'tenant';
    
    // Prepare user data using the correct schema fields
    const userData = {
      clerk_id: clerkUser.id, // Store Clerk ID in separate column
      email: primaryEmail,
      full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      phone_number: clerkUser.phoneNumbers?.[0]?.phoneNumber || null,
      profile_picture_url: clerkUser.imageUrl || null,
      user_type: defaultUserType, // Set user_type for enum column
      role: defaultUserType, // Also set role for text column
      updated_at: new Date().toISOString()
    };

    let result;

    if (existingUser) {
      // Update existing user, but don't change the role or user_type
      const updateData = { ...userData };
      delete updateData.role; // Don't overwrite role of existing users
      delete updateData.user_type; // Don't overwrite user_type of existing users
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', existingUser.id) // Use the existing user's ID
        .select()
        .single();

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return null;
      }

      result = data;
    } else {
      // Create new user with default role
      // Let Supabase auto-generate the UUID
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString()
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
export async function updateUserRole(clerkId: string, userType: 'tenant' | 'admin') {
  try {
    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role: userType,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user type:', error);
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
