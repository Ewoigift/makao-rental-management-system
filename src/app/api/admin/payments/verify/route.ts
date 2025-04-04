import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/auth/auth-utils';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
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
      .select('user_type, id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData || userData.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get payment ID from request body
    const { paymentId } = await request.json();
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Update the payment status to verified
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_by: userData.id,
        verification_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select();

    if (error) {
      console.error('Error verifying payment:', error);
      return NextResponse.json(
        { error: 'Failed to verify payment', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0] || null);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
