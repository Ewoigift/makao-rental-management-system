"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  PenToolIcon, 
  AlertCircle, 
  DollarSign,
  Megaphone
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'payment' | 'maintenance' | 'announcement' | 'alert';
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from the database
    const demoNotifications: Notification[] = [
      {
        id: 'n1',
        title: 'Rent Payment Confirmed',
        message: 'Your rent payment of KES 25,000 for May 2025 has been received and processed. Thank you!',
        date: '2025-04-01T08:30:00Z',
        type: 'payment',
        read: false
      },
      {
        id: 'n2',
        title: 'Maintenance Request Updated',
        message: 'Your maintenance request for "Leaking Faucet" (ID: MR-2025-042) has been updated to "In Progress".',
        date: '2025-03-28T14:15:00Z',
        type: 'maintenance',
        read: false
      },
      {
        id: 'n3',
        title: 'Water Shutdown Notice',
        message: 'There will be a scheduled water shutdown on April 10, 2025, from 9AM to 2PM for routine maintenance.',
        date: '2025-03-25T11:45:00Z',
        type: 'announcement',
        read: true
      },
      {
        id: 'n4',
        title: 'Rent Due Reminder',
        message: 'This is a friendly reminder that your rent payment of KES 25,000 is due on May 1, 2025.',
        date: '2025-03-25T09:00:00Z',
        type: 'payment',
        read: true
      },
      {
        id: 'n5',
        title: 'Security System Upgrade',
        message: 'We will be upgrading the building security system on April 15. You may experience brief interruptions with door access.',
        date: '2025-03-20T16:30:00Z',
        type: 'alert',
        read: true
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setNotifications(demoNotifications);
      setLoading(false);
    }, 800);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'payment':
        return <DollarSign className="h-5 w-5 text-blue-500" />;
      case 'maintenance':
        return <PenToolIcon className="h-5 w-5 text-orange-500" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5 text-purple-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} New
                </Badge>
              )}
            </h1>
            <p className="text-gray-500">Stay updated with important messages and alerts</p>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700">No Notifications</h3>
              <p className="text-gray-500 text-center mt-2">
                You don't have any notifications at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-colors ${notification.read ? 'bg-card' : 'bg-primary/5'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">
                          {notification.title}
                          {!notification.read && (
                            <span className="inline-block ml-2 w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(notification.date)}
                          </span>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                              className="h-7 px-2 text-xs"
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
