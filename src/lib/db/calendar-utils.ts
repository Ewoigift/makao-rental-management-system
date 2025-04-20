"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Type definitions
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  event_type: 'lease_start' | 'lease_end' | 'payment_due' | 'maintenance' | 'inspection' | 'other';
  related_entity_id?: string;
  related_entity_type?: 'lease' | 'unit' | 'tenant' | 'payment' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  unit_id: string;
  tenant_id?: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  reported_date: string;
  scheduled_date?: string;
  completion_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  unit?: {
    unit_number: string;
    property?: {
      name: string;
    }
  }
}

/**
 * Fetch calendar events for a specific date range
 */
export async function fetchCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  try {
    const supabase = createClientComponentClient();
    
    // First check if calendar_events table exists
    const { error: tableCheckError } = await supabase
      .from('calendar_events')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    // If table doesn't exist, return empty array
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.error('Calendar events table does not exist:', tableCheckError);
      return [];
    }
    
    // Fetch events within the date range
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString());
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

/**
 * Sync maintenance requests with calendar events
 */
export async function syncMaintenanceToCalendar(): Promise<void> {
  try {
    const supabase = createClientComponentClient();
    
    // First check if calendar_events table exists
    const { error: tableCheckError } = await supabase
      .from('calendar_events')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    // If table doesn't exist, we can't sync
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.error('Calendar events table does not exist:', tableCheckError);
      return;
    }
    
    // Fetch all maintenance requests with scheduled dates
    const { data: maintenanceRequests, error: maintenanceError } = await supabase
      .from('maintenance_requests')
      .select('*, unit:units(unit_number, property:properties(name))')
      .not('scheduled_date', 'is', null);
    
    if (maintenanceError) throw maintenanceError;
    
    if (!maintenanceRequests || maintenanceRequests.length === 0) {
      return; // No maintenance requests to sync
    }
    
    // Get existing maintenance events
    const { data: existingEvents, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('event_type', 'maintenance')
      .eq('related_entity_type', 'maintenance');
    
    if (eventsError) throw eventsError;
    
    const existingEventMap = new Map();
    (existingEvents || []).forEach(event => {
      if (event.related_entity_id) {
        existingEventMap.set(event.related_entity_id, event);
      }
    });
    
    // Process each maintenance request
    for (const request of maintenanceRequests) {
      const existingEvent = existingEventMap.get(request.id);
      const scheduledDate = new Date(request.scheduled_date);
      
      // Create end date (default to 1 hour after start)
      const endDate = new Date(scheduledDate);
      endDate.setHours(endDate.getHours() + 1);
      
      // Create maintenance event title
      const propertyName = request.unit?.property?.name || 'Property';
      const unitNumber = request.unit?.unit_number || 'Unknown Unit';
      const eventTitle = `Maintenance: ${propertyName} - Unit ${unitNumber}`;
      
      if (!existingEvent) {
        // Create new calendar event
        await supabase.from('calendar_events').insert({
          title: eventTitle,
          description: request.description,
          start_date: scheduledDate.toISOString(),
          end_date: endDate.toISOString(),
          all_day: false,
          event_type: 'maintenance',
          related_entity_id: request.id,
          related_entity_type: 'maintenance'
        });
      } else if (
        existingEvent.title !== eventTitle ||
        existingEvent.description !== request.description ||
        new Date(existingEvent.start_date).getTime() !== scheduledDate.getTime()
      ) {
        // Update existing event if details have changed
        await supabase
          .from('calendar_events')
          .update({
            title: eventTitle,
            description: request.description,
            start_date: scheduledDate.toISOString(),
            end_date: endDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEvent.id);
      }
      
      // Remove from map to track which events need to be deleted
      existingEventMap.delete(request.id);
    }
    
    // Delete events for maintenance requests that no longer exist or don't have scheduled dates
    for (const [_, event] of existingEventMap.entries()) {
      await supabase.from('calendar_events').delete().eq('id', event.id);
    }
    
  } catch (error) {
    console.error('Error syncing maintenance to calendar:', error);
  }
}

/**
 * Add a calendar event
 */
export async function addCalendarEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  try {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data?.id || null;
  } catch (error) {
    console.error('Error adding calendar event:', error);
    return null;
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    
    const { error } = await supabase
      .from('calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}
