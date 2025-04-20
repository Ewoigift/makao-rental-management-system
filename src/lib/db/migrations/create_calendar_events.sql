-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    event_type TEXT NOT NULL CHECK (event_type IN ('lease_start', 'lease_end', 'payment_due', 'maintenance', 'inspection', 'other')),
    related_entity_id UUID,
    related_entity_type TEXT CHECK (related_entity_type IN ('lease', 'unit', 'tenant', 'payment', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster date range queries
CREATE INDEX IF NOT EXISTS calendar_events_date_idx ON public.calendar_events (start_date, end_date);

-- Create index for faster event type queries
CREATE INDEX IF NOT EXISTS calendar_events_type_idx ON public.calendar_events (event_type);

-- Create index for related entity lookups
CREATE INDEX IF NOT EXISTS calendar_events_related_entity_idx ON public.calendar_events (related_entity_type, related_entity_id);

-- Create RLS policies for the calendar_events table
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all calendar events
CREATE POLICY calendar_events_select_policy ON public.calendar_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own calendar events
CREATE POLICY calendar_events_insert_policy ON public.calendar_events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own calendar events
CREATE POLICY calendar_events_update_policy ON public.calendar_events
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own calendar events
CREATE POLICY calendar_events_delete_policy ON public.calendar_events
    FOR DELETE USING (auth.role() = 'authenticated');
