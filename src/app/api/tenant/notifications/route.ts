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

    const supabase = createSupabaseAdminClient();
    
    // First get the user's internal ID based on clerk_id
    const { data: userData, error: userIdError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();
      
    if (userIdError) {
      console.error('Error fetching user data:', userIdError);
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: userIdError },
        { status: 500 }
      );
    }

    // Get all notifications for this tenant
    // Currently using a mock, but in a real implementation this would fetch from a notifications table
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        title,
        content,
        notification_type,
        is_read,
        created_at
      `)
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (error) {
      // If the table doesn't exist yet, return mock data
      if (error.code === '42P01') { // relation does not exist
        // Generate some mock notifications
        const mockNotifications = [
          {
            id: 'n1',
            title: 'Rent Payment Received',
            content: 'Your rent payment for this month has been received.',
            notification_type: 'payment',
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          },
          {
            id: 'n2', 
            title: 'Maintenance Request Updated',
            content: 'Your request for electrical repair has been completed.',
            notification_type: 'maintenance',
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          },
          {
            id: 'n3',
            title: 'Building Announcement',
            content: 'The water will be shut off for maintenance on Saturday from 8am-12pm.',
            notification_type: 'announcement',
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          }
        ];
        return NextResponse.json(mockNotifications);
      }
      
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
