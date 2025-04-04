"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

// Types based on Supabase schema
interface CalendarEvent {
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

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Replace with your actual API call
        const { supabase } = await import('@/lib/supabase/client');
        
        // Get start and end of the month for filtering
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_date', startOfMonth.toISOString())
          .lte('start_date', endOfMonth.toISOString());
        
        if (error) throw error;
        
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Use sample data if fetch fails
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentDate]);

  // Generate calendar days
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Day of the week for the first day of the month (0-6, 0 is Sunday)
    const firstDayOfMonthWeekday = firstDayOfMonth.getDay();
    
    // Calculate the first day to display (may be from the previous month)
    const firstDayToDisplay = new Date(firstDayOfMonth);
    firstDayToDisplay.setDate(1 - firstDayOfMonthWeekday);
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Generate 42 days (6 weeks x 7 days)
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(firstDayToDisplay);
      currentDay.setDate(firstDayToDisplay.getDate() + i);
      
      const isCurrentMonth = currentDay.getMonth() === month;
      const isToday = 
        currentDay.getDate() === today.getDate() && 
        currentDay.getMonth() === today.getMonth() && 
        currentDay.getFullYear() === today.getFullYear();
      
      // Find events for this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start_date);
        return (
          eventDate.getDate() === currentDay.getDate() &&
          eventDate.getMonth() === currentDay.getMonth() &&
          eventDate.getFullYear() === currentDay.getFullYear()
        );
      });
      
      days.push({
        date: currentDay,
        isCurrentMonth,
        isToday,
        events: dayEvents
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, events]);

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      return newDate;
    });
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'lease_start':
        return <Badge className="bg-green-100 text-green-800">New Lease</Badge>;
      case 'lease_end':
        return <Badge className="bg-red-100 text-red-800">Lease End</Badge>;
      case 'payment_due':
        return <Badge className="bg-blue-100 text-blue-800">Payment Due</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'inspection':
        return <Badge className="bg-purple-100 text-purple-800">Inspection</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Other</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Events Calendar</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-medium">
                  {getMonthName(currentDate)} {currentDate.getFullYear()}
                </div>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">Loading calendar...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* Day names */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center font-medium">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`p-2 min-h-[100px] border ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                    } ${
                      day.isToday ? 'border-blue-500' : 'border-gray-200'
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold ${day.isToday ? 'text-blue-500' : ''}`}>
                        {day.date.getDate()}
                      </span>
                      {day.events.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          {day.events.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {day.events.slice(0, 3).map((event) => (
                        <div 
                          key={event.id} 
                          className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100"
                          title={event.description || ''}
                        >
                          {getEventBadge(event.event_type)}
                          <div className="truncate mt-1">{event.title}</div>
                        </div>
                      ))}
                      {day.events.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{day.events.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
