import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/auth/auth-utils';

export async function GET() {
  try {
    console.log('Fetching all payments for admin - simple endpoint');
    const supabase = createSupabaseAdminClient();
    
    // Fetch all payments with correct relationships
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        lease:leases(
          id, 
          tenant:users(id, full_name, email),
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
      console.error('Error fetching admin payments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payments', details: error },
        { status: 500 }
      );
    }

    console.log('Admin payments data count:', data?.length);
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
