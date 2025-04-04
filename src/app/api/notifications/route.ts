import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sendNotification, NotificationType } from '@/lib/notifications/notification-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, recipientId, variables, saveToDatabase = true } = body;

    if (!type || !recipientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If saveToDatabase is true, save notification to database
    if (saveToDatabase) {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type,
          title: variables?.title || type,
          message: variables?.message || '',
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving notification to database:', error);
      }
    }

    // Get user details from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', recipientId)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get email and phone from user data
    const email: string | null = userData.email;
    const phone: string | null = userData.phone;

    // Send notification
    await sendNotification({
      type: type as NotificationType,
      recipient: {
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        email: email,
        phone: phone
      },
      variables
    });

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully'
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
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get notifications for the user
    const { data: notifications, error: notificationsError, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (notificationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Get unread count
    const { count: unreadCount, error: unreadError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.id)
      .eq('is_read', false);

    if (unreadError) {
      console.error('Error fetching unread count:', unreadError);
    }

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: {
        total: count || 0,
        unread: unreadCount || 0,
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
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, read = true } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the notification belongs to the user
    const { data: notificationData, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('user_id', userData.id)
      .single();

    if (notificationError || !notificationData) {
      return NextResponse.json(
        { error: 'Notification not found or does not belong to user' },
        { status: 404 }
      );
    }

    // Mark notification as read/unread
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: read })
      .eq('id', notificationId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedNotification
    });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}
