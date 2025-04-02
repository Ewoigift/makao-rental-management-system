import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { sendNotification } from '@/lib/notifications/notification-service';
import { generatePDFReceipt } from '@/lib/email/nodemailer';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Create a new payment record
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { 
      amount, 
      paymentType, 
      month, 
      reference, 
      paymentMethod,
      leaseId,
      unitId,
      propertyId
    } = body;

    // Validate required fields
    if (!amount || !paymentType || !month || !reference || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Get user details from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userData.id,
        amount: parseFloat(amount),
        payment_type: paymentType,
        month,
        reference,
        payment_method: paymentMethod,
        status: 'pending', // Initial status is pending until verified
        lease_id: leaseId,
        unit_id: unitId,
        property_id: propertyId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    // Get property manager's user ID for notification
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select('manager_id')
      .eq('id', propertyId)
      .single();

    if (!propertyError && propertyData?.manager_id) {
      // Get property manager's Clerk ID
      const { data: managerData } = await supabase
        .from('users')
        .select('clerk_id')
        .eq('id', propertyData.manager_id)
        .single();

      if (managerData?.clerk_id) {
        // Notify property manager about new payment
        await fetch(`${request.nextUrl.origin}/api/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'PAYMENT_CONFIRMATION',
            recipientId: managerData.clerk_id,
            variables: {
              tenantName: `${userData.first_name} ${userData.last_name}`,
              amount,
              month,
              reference,
              paymentMethod,
              date: new Date().toISOString(),
              status: 'pending'
            }
          })
        });
      }
    }

    // Send payment confirmation to tenant
    await sendNotification({
      type: 'PAYMENT_CONFIRMATION',
      recipient: {
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        phone: userData.phone
      },
      variables: {
        amount,
        month,
        reference,
        paymentMethod,
        date: new Date().toISOString(),
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      data: payment
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    );
  }
}

/**
 * Get payment history for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const paymentType = searchParams.get('paymentType');
    const month = searchParams.get('month');
    
    // Get user ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from('payments')
      .select(`
        *,
        units:unit_id (unit_number),
        properties:property_id (name)
      `)
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (paymentType) {
      query = query.eq('payment_type', paymentType);
    }
    
    if (month) {
      query = query.eq('month', month);
    }
    
    // Apply pagination
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Get total count
    const countQuery = supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.id);
    
    // Apply the same filters to count query
    if (status) {
      countQuery.eq('status', status);
    }
    
    if (paymentType) {
      countQuery.eq('payment_type', paymentType);
    }
    
    if (month) {
      countQuery.eq('month', month);
    }
    
    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit,
        offset
      }
    });
  } catch (error: any) {
    console.error('Error fetching payment history:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}

/**
 * Update payment status (for admin verification)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { paymentId, status, verificationNotes } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if user is an admin or property manager
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Only allow admins and property managers to update payment status
    if (userData.role !== 'admin' && userData.role !== 'property_manager') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins and property managers can update payment status' },
        { status: 403 }
      );
    }

    // Get payment details
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*, users:user_id (*)')
      .eq('id', paymentId)
      .single();

    if (paymentError || !paymentData) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status,
        verification_notes: verificationNotes,
        verified_at: status === 'verified' ? new Date().toISOString() : null,
        verified_by: status === 'verified' ? userData.id : null
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // If payment is verified, generate receipt and send notification
    if (status === 'verified') {
      try {
        // Generate PDF receipt
        const receiptData = {
          id: paymentData.id,
          reference: paymentData.reference,
          amount: paymentData.amount,
          date: paymentData.created_at,
          paymentMethod: paymentData.payment_method,
          month: paymentData.month,
          paymentType: paymentData.payment_type,
          tenantName: `${paymentData.users.first_name} ${paymentData.users.last_name}`,
          verifiedAt: new Date().toISOString()
        };
        
        const pdfReceipt = await generatePDFReceipt(receiptData);
        
        // Send notification with receipt
        await sendNotification({
          type: 'PAYMENT_CONFIRMATION',
          recipient: {
            name: `${paymentData.users.first_name} ${paymentData.users.last_name}`,
            email: paymentData.users.email,
            phone: paymentData.users.phone
          },
          variables: {
            amount: paymentData.amount,
            month: paymentData.month,
            reference: paymentData.reference,
            paymentMethod: paymentData.payment_method,
            date: paymentData.created_at,
            status: 'verified'
          },
          attachments: [
            {
              filename: `receipt-${paymentData.reference}.pdf`,
              content: pdfReceipt
            }
          ]
        });
      } catch (error) {
        console.error('Error generating receipt:', error);
        // Continue even if receipt generation fails
      }
    } else if (status === 'rejected') {
      // Send notification about rejected payment
      await sendNotification({
        type: 'PAYMENT_CONFIRMATION',
        recipient: {
          name: `${paymentData.users.first_name} ${paymentData.users.last_name}`,
          email: paymentData.users.email,
          phone: paymentData.users.phone
        },
        variables: {
          amount: paymentData.amount,
          month: paymentData.month,
          reference: paymentData.reference,
          paymentMethod: paymentData.payment_method,
          date: paymentData.created_at,
          status: 'rejected',
          rejectionReason: verificationNotes || 'Payment verification failed'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedPayment
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
