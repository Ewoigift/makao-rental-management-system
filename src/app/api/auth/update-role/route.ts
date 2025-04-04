import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user_type from request body
    const { role } = await request.json();
    
    // Map 'landlord' to 'admin' for backward compatibility
    const userType = role === 'landlord' ? 'admin' : role;
    
    if (!userType || !['tenant', 'admin'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" error
      return NextResponse.json(
        { error: 'Error fetching user data' },
        { status: 500 }
      );
    }

    let userData;

    if (existingUser) {
      // Update existing user's user_type
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ 
          user_type: userType,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update user role' },
          { status: 500 }
        );
      }

      userData = data;
    } else {
      // Create new user with selected user_type
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          user_type: userType,
          full_name: 'New User', // This will be updated later via webhook
          email: 'pending@example.com', // This will be updated later via webhook
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        );
      }

      userData = data;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userData.id,
        user_type: userData.user_type
      }
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
