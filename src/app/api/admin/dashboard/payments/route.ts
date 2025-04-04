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

    // Fetch recent payments with correct schema
    // Use the correct relationship between payments and users through leases
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, 
        amount, 
        payment_date, 
        status,
        lease:leases(
          id,
          tenant:users(id, full_name),
          unit:units(id, unit_number)
        )
      `)
      .order('payment_date', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching recent payments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recent payments', details: error },
        { status: 500 }
      );
    }

    // Transform the data to a simpler format for the frontend
    const transformedData = data?.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      payment_date: payment.payment_date,
      status: payment.status,
      tenant_name: payment.lease?.tenant?.full_name || 'Unknown',
      unit_number: payment.lease?.unit?.unit_number || 'Unknown'
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
