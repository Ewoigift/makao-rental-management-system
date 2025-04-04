import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/auth/auth-utils';
// Simple UUID generator function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Define event types for type safety
type ClerkEvent = {
  data: {
    id: string;
    email_addresses: {
      email_address: string;
      id: string;
    }[];
    first_name: string;
    last_name: string;
    image_url: string;
    created_at: number;
    updated_at: number;
  };
  object: string;
  type: string;
};

export async function POST(req: Request) {
  // Get the headers
  const headersList = headers();
  const svix_id = await headersList.then(h => h.get('svix-id'));
  const svix_timestamp = await headersList.then(h => h.get('svix-timestamp'));
  const svix_signature = await headersList.then(h => h.get('svix-signature'));

  // If there are no headers, return 400
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is missing');
    return NextResponse.json(
      { success: false, error: 'Webhook secret is missing' },
      { status: 500 }
    );
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  // Verify the payload with the headers
  let evt: ClerkEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { success: false, error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  // Handle the event
  const { type, data } = evt;

  try {
    // Get admin supabase client
    const supabase = createSupabaseAdminClient();

    // Handle user creation
    if (type === 'user.created') {
      // Extract user data from Clerk event
      const {
        id: clerk_id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        created_at
      } = data;

      // Get primary email
      const primaryEmail = email_addresses.length > 0 
        ? email_addresses[0].email_address 
        : '';

      // Determine user role based on email patterns
      // For production, you might want more robust role assignment logic
      const email = primaryEmail.toLowerCase();
      
      // Default role assignment based on email patterns
      let userType = 'tenant'; // Default role is tenant
      
      // Check for admin/landlord email patterns
      if (
        email.includes('admin') || 
        email.includes('landlord') || 
        email.includes('owner') || 
        email.includes('manager') ||
        email.endsWith('.admin@') ||
        email.endsWith('.landlord@')
      ) {
        userType = 'admin';
      }

      // Insert new user into Supabase
      const { data: userData, error } = await supabase
        .from('users')
        .insert({
          // Let Supabase auto-generate the ID
          clerk_id: clerk_id, // Store Clerk ID in a separate column
          email: primaryEmail,
          first_name: first_name || '',
          last_name: last_name || '',
          role: userType,
          profile_image_url: image_url,
          created_at: new Date(created_at).toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting user into Supabase:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data: userData });
    }

    // Handle user update
    if (type === 'user.updated') {
      // Extract user data from Clerk event
      const {
        id: clerk_id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        updated_at
      } = data;

      // Get primary email
      const primaryEmail = email_addresses.length > 0 
        ? email_addresses[0].email_address 
        : '';

      // Update user in Supabase
      const { data: userData, error } = await supabase
        .from('users')
        .update({
          email: primaryEmail,
          full_name: `${first_name || ''} ${last_name || ''}`.trim(),
          profile_picture_url: image_url,
          updated_at: new Date(updated_at).toISOString()
        })
        .eq('clerk_id', clerk_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data: userData });
    }

    // Handle user deletion
    if (type === 'user.deleted') {
      const { id: clerk_id } = data;

      // Archive user in Supabase (you might want to actually delete or implement a soft delete)
      const { error } = await supabase
        .from('users')
        .update({ 
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', clerk_id);

      if (error) {
        console.error('Error archiving user in Supabase:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Return a 200 for any other event type
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
