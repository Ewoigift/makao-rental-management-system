import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/auth/auth-utils';
import { auth } from '@clerk/nextjs';

export async function GET() {
  try {
    // Check authentication
    const { userId } = auth();
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

    // Fetch all maintenance requests with correct schema
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(`
        id, 
        tenant_id,
        unit_id, 
        title, 
        description, 
        priority,
        status, 
        request_date,
        scheduled_date,
        completed_date,
        created_at,
        updated_at,
        tenant:users(id, full_name, email),
        unit:units(
          id, 
          unit_number,
          property:properties(
            id, 
            name,
            address
          )
        )
      `)
      .order('created_at', { ascending: false });

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
