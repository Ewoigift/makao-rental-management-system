import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/auth/auth-utils';
import { getAuth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Check authentication using headers
    const { userId } = getAuth({
      request: { headers: new Headers() }
    });
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseAdminClient();
    
    // First get the user's internal ID based on clerk_id
    const { data: userData, error: userIdError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();
      
    if (userIdError) {
      console.error('Error fetching user data:', userIdError);
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: userIdError },
        { status: 500 }
      );
    }

    // Get all maintenance requests for this tenant with correct schema
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
      .eq('tenant_id', userData.id)
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
