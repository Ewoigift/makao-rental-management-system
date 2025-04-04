import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/auth/auth-utils';

export async function GET() {
  try {
    console.log('Fetching payments for dashboard - simple endpoint');
    const supabase = createSupabaseAdminClient();
    
    // Fetch recent payments with correct schema
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
      .limit(5);

    if (error) {
      console.error('Error fetching recent payments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recent payments', details: error },
        { status: 500 }
      );
    }

    console.log('Payments data:', data?.length);
    
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
