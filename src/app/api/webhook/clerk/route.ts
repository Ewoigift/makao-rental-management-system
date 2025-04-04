import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // Get the Clerk webhook signature
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    return new Response('Missing webhook secret', { status: 500 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }

  // Initialize Supabase admin client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Handle the different webhook events
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, phone_numbers, first_name, last_name } = evt.data;
    
    const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id);
    const primaryPhone = phone_numbers?.find(phone => phone.id === evt.data.primary_phone_number_id);
    
    try {
      // Check if we have a preferred role stored in clerk metadata
      const userMetadata = evt.data.private_metadata || {};
      const preferredRole = userMetadata.role || 'tenant';
      
      // Create the user in Supabase with auto-generated UUID
      // and store Clerk ID in clerk_id field
      await supabase.from('users').insert({
        clerk_id: id, // Store Clerk ID in clerk_id field instead of id
        email: primaryEmail?.email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim(),
        phone_number: primaryPhone?.phone_number,
        user_type: preferredRole, // Use selected role if available
        role: preferredRole, // Use same value for text-based role field
      });
      
      return new Response('User created in Supabase', { status: 200 });
    } catch (error) {
      console.error('Error creating user in Supabase:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }
  
  if (eventType === 'user.updated') {
    const { id, email_addresses, phone_numbers, first_name, last_name } = evt.data;
    
    const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id);
    const primaryPhone = phone_numbers?.find(phone => phone.id === evt.data.primary_phone_number_id);
    
    try {
      // First, find the user by clerk_id
      const { data: userData, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', id)
        .single();
      
      if (findError || !userData) {
        console.error('Error finding user by clerk_id:', findError);
        return new Response('User not found', { status: 404 });
      }
      
      // Update the user in Supabase by the database id
      await supabase.from('users').update({
        email: primaryEmail?.email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim(),
        phone_number: primaryPhone?.phone_number,
        updated_at: new Date().toISOString(),
      }).eq('id', userData.id);
      
      return new Response('User updated in Supabase', { status: 200 });
    } catch (error) {
      console.error('Error updating user in Supabase:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }
  
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      // First, find the user by clerk_id
      const { data: userData, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', id)
        .single();
      
      if (findError || !userData) {
        console.error('Error finding user by clerk_id:', findError);
        return new Response('User not found', { status: 404 });
      }
      
      // Handle user deletion in Supabase
      // Note: We're archiving users instead of deleting them
      // to preserve referential integrity
      await supabase.from('users').update({
        email: `deleted_${id}@deleted.com`,
        phone_number: null,
        updated_at: new Date().toISOString(),
      }).eq('id', userData.id);
      
      return new Response('User marked as deleted in Supabase', { status: 200 });
    } catch (error) {
      console.error('Error handling user deletion in Supabase:', error);
      return new Response('Error handling user deletion', { status: 500 });
    }
  }

  // Return a 200 for any other event types
  return new Response('Webhook received', { status: 200 });
}
