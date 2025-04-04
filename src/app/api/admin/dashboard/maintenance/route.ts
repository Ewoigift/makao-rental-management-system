import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/auth/auth-utils';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    // Check authentication using the actual request
    const { userId } = getAuth({
      request: request
    });
    
    console.log('Auth userId:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role to ensure they're an admin
    const supabase = createSupabaseAdminClient();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_type')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData || userData.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch maintenance requests with correct schema
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(`
        id, 
        unit_id, 
        title, 
        description, 
        status, 
        created_at,
        unit:units(id, unit_number)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching maintenance requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch maintenance requests', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
