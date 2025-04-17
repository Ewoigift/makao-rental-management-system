import { createSupabaseAdminClient } from "@/lib/auth/auth-utils";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

export async function GET(request: Request) {
  try {
    // Get auth and query params
    const { userId } = auth();
    const url = new URL(request.url);
    const paymentId = url.searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createSupabaseAdminClient();

    // Get the payment details with related data
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenant:users!tenant_id(*),
        unit:units!unit_id(
          *,
          property:properties(
            *,
            landlord:users!landlord_id(*)
          )
        )
      `)
      .eq('id', paymentId)
      .single();

    if (error) {
      console.error('Error fetching payment:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment data', details: error },
        { status: 500 }
      );
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_type, id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: userError },
        { status: 500 }
      );
    }

    // Check if user has access to this payment
    const userRole = userData.user_type;
    const userId = userData.id;

    // Admins can view any payment
    if (userRole !== 'admin') {
      // Tenants can only view their own payments
      if (userRole === 'tenant' && payment.tenant_id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized to view this payment' },
          { status: 403 }
        );
      }

      // Landlords can only view payments for their properties
      if (userRole === 'landlord' && payment.unit?.property?.landlord_id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized to view this payment' },
          { status: 403 }
        );
      }
    }

    // Prepare invoice data
    const invoiceData = {
      id: payment.id,
      invoiceNumber: payment.invoice_number || `INV-${payment.id.slice(0, 6).toUpperCase()}`,
      issuedDate: new Date(payment.due_date).toISOString().split('T')[0],
      dueDate: new Date(payment.due_date).toISOString().split('T')[0],
      paidDate: payment.status === 'paid' ? new Date(payment.payment_date).toISOString().split('T')[0] : undefined,
      status: payment.status,
      amount: payment.amount,
      tenantName: payment.tenant?.full_name || 'Tenant',
      tenantEmail: payment.tenant?.email,
      propertyName: payment.unit?.property?.name || 'Property',
      unitNumber: payment.unit?.unit_number || 'Unit',
      landlordName: payment.unit?.property?.landlord?.full_name || 'Landlord',
      landlordEmail: payment.unit?.property?.landlord?.email,
      description: `Rent payment for ${payment.unit?.unit_number} at ${payment.unit?.property?.name}`,
      paymentMethod: payment.payment_method
    };

    return NextResponse.json(invoiceData);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
