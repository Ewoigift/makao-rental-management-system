import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs';
import { sendNotification, NotificationType } from '@/lib/notifications/notification-service';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, recipientId, variables, saveToDatabase = true } = body;

    if (!type || !recipientId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes: NotificationType[] = [
      'PAYMENT_REMINDER',
      'PAYMENT_CONFIRMATION',
      'MAINTENANCE_UPDATE',
      'LEASE_EXPIRY',
      'WELCOME',
      'GENERAL_ANNOUNCEMENT'
    ];

    if (!validTypes.includes(type as NotificationType)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Get user details from Clerk
    const user = await clerkClient.users.getUser(recipientId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get primary email and phone
    const email = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    
    const phone = user.phoneNumbers.find(
      phone => phone.id === user.primaryPhoneNumberId
    )?.phoneNumber;

    // Send notification
    const result = await sendNotification({
      type: type as NotificationType,
      recipient: {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email,
        phone
      },
      variables
    });

    // Save notification to database if requested
    if (saveToDatabase) {
      await supabase.from('notifications').insert({
        user_id: recipientId,
        type,
        content: JSON.stringify(variables),
        sms_sent: result.sms.success,
        email_sent: result.email.success,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get notifications from database
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

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
    console.error('Error fetching notifications:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, read = true } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notificationId parameter' },
        { status: 400 }
      );
    }

    // Update notification in database
    const { data, error } = await supabase
      .from('notifications')
      .update({ read })
      .eq('id', notificationId)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}
