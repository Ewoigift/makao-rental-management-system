/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

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
    
    // Properly format the query with filter in the correct position
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .maybeSingle(); // Use maybeSingle instead of single to prevent errors if no record found

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
    const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
    
    if (!primaryEmail) {
      console.error('No email address found for Clerk user');
      return null;
    }

    // Check if user already exists by clerk_id
    let { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUser.id)
      .maybeSingle();
    
    // If user not found by clerk_id, try to find by email
    if (!existingUser) {
      console.log(`User not found with clerk_id ${clerkUser.id}, checking by email ${primaryEmail}`);
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', primaryEmail)
        .maybeSingle();
      
      if (emailError) {
        console.error('Error finding user by email:', emailError);
      } else if (userByEmail) {
        console.log(`Found existing user by email: ${primaryEmail}`);
        existingUser = userByEmail;
      }
    }
    
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
      // Preserve the original role values
      const updateData = { 
        ...userData,
        clerk_id: clerkUser.id, // Always update the clerk_id to match current user
        role: existingUser.role || defaultUserType,
        user_type: existingUser.user_type || defaultUserType
      };
      
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
      console.log('Updated existing user:', result);
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
      console.log('Created new user:', result);
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
    console.log(`Updating user role for clerk_id ${clerkId} to ${userType}`);
    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role: userType,
        user_type: userType, // Update both fields for consistency
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user type:', error);
      return null;
    }

    console.log('User role updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return null;
  }
}

// Function to get user role
export async function getUserRole(clerkId: string) {
  try {
    console.log(`[getUserRole] Fetching user data for clerkId: ${clerkId}`);
    const user = await getUserByClerkId(clerkId);
    console.log(`[getUserRole] Raw user data fetched:`, user);

    if (!user) {
      console.warn(`[getUserRole] No user found in DB for clerkId: ${clerkId}`);
      return null;
    }

    // Check both fields, prioritize user_type if available
    const role = user?.user_type || user?.role || null;
    console.log(`[getUserRole] Determined role for user ${clerkId}: ${role} (user_type: ${user?.user_type}, role: ${user?.role})`);
    return role;
  } catch (error) {
    console.error(`[getUserRole] Error fetching role for clerkId ${clerkId}:`, error);
    return null;
  }
}
