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

    // Fetch payments with related data
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenant:users(id, full_name, email),
        lease:leases(
          id, 
          unit_id,
          unit:units(
            id, 
            unit_number,
            property:properties(
              id, 
              name
            )
          )
        )
      `)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payments', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
