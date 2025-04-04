import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/auth/auth-utils';

export async function GET() {
  try {
    console.log('Fetching maintenance requests for dashboard - simple endpoint');
    const supabase = createSupabaseAdminClient();
    
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

    console.log('Maintenance data:', data?.length);
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
