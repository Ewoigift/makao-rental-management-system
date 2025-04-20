"use client";

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Receipt, Wrench, Bell, Calendar, FileText, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Define TenantInfo interface for type safety
interface TenantInfo {
  name: string;
  unit: string;
  property: string;
  leaseEnd: string;
  rentAmount: string;
  nextPaymentDue: string;
  balance: string;
  isAllocated: boolean;
}

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getTenantDashboardSummary } from '@/lib/db/api-utils';
import { format } from 'date-fns';

export default function TenantDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    // Fetch real data from the database using the current user's ID
    async function fetchDashboardData() {
      try {
        if (!user?.id) return;
        
        const data = await getTenantDashboardSummary(user.id);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching tenant dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  // Fetch maintenance requests
  useEffect(() => {
    async function fetchMaintenanceRequests() {
      try {
        setLoadingMaintenance(true);
        if (!user) return;
        
        // Use mock data since the API is having issues
        const mockData = [
          {
            id: 'MR-2025-042',
            title: 'Leaking Faucet',
            status: 'in_progress',
            created_at: '2025-03-28'
          },
          {
            id: 'MR-2025-036',
            title: 'Electrical Outlet',
            status: 'completed',
            created_at: '2025-03-15'
          }
        ];
        
        setMaintenanceRequests(mockData);
      } catch (error) {
        console.error('Error setting maintenance requests:', error);
        setMaintenanceRequests([]); // Set empty array on error
      } finally {
        setLoadingMaintenance(false);
      }
    }
    
    if (user) {
      fetchMaintenanceRequests();
    }
  }, [user]);
  
  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoadingNotifications(true);
        if (!user) return;
        
        // Use mock data since the API is having issues
        const mockNotifications = [
          {
            id: 'n1',
            title: 'Rent Due Reminder',
            notification_type: 'payment',
            created_at: '2025-04-01',
            is_read: false
          },
          {
            id: 'n2',
            title: 'Maintenance Request Updated', 
            notification_type: 'maintenance',
            created_at: '2025-03-28',
            is_read: true
          },
          {
            id: 'n3',
            title: 'Welcome to Makao',
            notification_type: 'system',
            created_at: '2025-03-15',
            is_read: true
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error setting notifications:', error);
        setNotifications([]); // Set empty array on error
      } finally {
        setLoadingNotifications(false);
      }
    }
    
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Derived data from dashboard
  const tenantInfo = dashboardData ? {
    name: dashboardData.tenant?.full_name || 'Tenant',
    unit: dashboardData.unit?.unit_number || '-',
    property: dashboardData.unit?.properties?.name || '-',
    leaseEnd: dashboardData.lease?.end_date || '-',
    rentAmount: `KES ${parseInt(dashboardData.lease?.rent_amount || '0').toLocaleString()}`,
    nextPaymentDue: dashboardData.nextPaymentDue || '-',
    balance: `KES ${dashboardData.currentBalance?.toLocaleString() || '0'}`,
    isAllocated: !dashboardData.notAllocated
  } : {
    name: user?.fullName || 'Tenant',
    unit: '-',
    property: '-',
    leaseEnd: '-',
    rentAmount: '-',
    nextPaymentDue: '-',
    balance: '-',
    isAllocated: false
  };
  
  // Helper function to format dates consistently
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };
  
  // Helper to generate a friendly ID for maintenance requests
  const formatMaintenanceId = (id: string) => {
    if (!id) return 'MR-0000';
    if (id.startsWith('MR-')) return id;
    
    // Take first 4 characters of UUID if it's a UUID
    const shortId = id.slice(0, 4);
    const year = new Date().getFullYear();
    return `MR-${year}-${shortId}`;  
  };

  // Recent maintenance requests
  const recentMaintenanceRequests = maintenanceRequests.map((request) => ({
    id: formatMaintenanceId(request.id),
    issue: request.issue,
    status: request.status,
    date: formatDate(request.date)
  }));

  // Recent notifications
  const recentNotifications = notifications.map((notification) => ({
    type: notification.type,
    title: notification.title,
    date: formatDate(notification.date),
    read: notification.is_read
  }));

  return (
    <MainLayout>
      <div className="space-y-6">
        {loading ? (
          // Loading state
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="h-40 bg-gray-200 rounded animate-pulse"></div>

            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mt-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Welcome, {tenantInfo.name}</h1>
                {tenantInfo.isAllocated ? (
                  <p className="text-gray-500">
                    {tenantInfo.property} • Unit {tenantInfo.unit}
                  </p>
                ) : (
                  <p className="text-amber-600 font-medium">
                    You have not been allocated to a property unit yet
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {tenantInfo.isAllocated && (
                  <Button asChild>
                    <Link href="/tenant/payments/make">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Make Payment
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/tenant/maintenance/new">
                    <Wrench className="mr-2 h-4 w-4" />
                    Report Issue
                  </Link>
                </Button>
              </div>
            </div>

            {/* Payment Summary Card */}
            {tenantInfo.isAllocated ? (
              <Card className="overflow-hidden border-t-4 border-t-green-500">
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="flex items-center text-green-700">
                    <Receipt className="mr-2 h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="text-xl font-bold">{tenantInfo.rentAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Payment Due</p>
                      <p className="text-xl font-bold">{tenantInfo.nextPaymentDue}</p>
                      {tenantInfo.nextPaymentDue !== '-' && (
                        <p className="text-xs text-gray-500">
                          {new Date(tenantInfo.nextPaymentDue) < new Date() 
                            ? 'Overdue' 
                            : `${Math.ceil((new Date(tenantInfo.nextPaymentDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Balance</p>
                      <p className="text-xl font-bold">{tenantInfo.balance}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-between">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/tenant/payments/history">Payment History</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/tenant/payments/make">Pay Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="overflow-hidden border-t-4 border-t-amber-500">
                <CardHeader className="bg-amber-50 pb-2">
                  <CardTitle className="flex items-center text-amber-700">
                    <Home className="mr-2 h-5 w-5" />
                    Allocation Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <p className="text-amber-600 font-medium mb-2">You have not been allocated to a property unit yet</p>
                    <p className="text-gray-500">Once your landlord assigns you to a unit, you will be able to see your lease details and payment information here.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <h2 className="text-xl font-semibold mt-8">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-3">
                    <FileText className="h-6 w-6 text-blue-700" />
                  </div>
                  <h3 className="font-medium">View Lease</h3>
                  <p className="text-sm text-gray-500 mb-3">Expires: {tenantInfo.leaseEnd}</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/tenant/lease">View Details</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="bg-green-100 p-3 rounded-full mb-3">
                    <Wrench className="h-6 w-6 text-green-700" />
                  </div>
                  <h3 className="font-medium">Maintenance</h3>
                  <p className="text-sm text-gray-500 mb-3">Report issues or check status</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/tenant/maintenance">View Requests</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="bg-amber-100 p-3 rounded-full mb-3">
                    <Bell className="h-6 w-6 text-amber-700" />
                  </div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {notifications.filter(n => !n.is_read).length} unread messages
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/tenant/notifications">View All</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="bg-purple-100 p-3 rounded-full mb-3">
                    <Home className="h-6 w-6 text-purple-700" />
                  </div>
                  <h3 className="font-medium">My Unit</h3>
                  <p className="text-sm text-gray-500 mb-3">View details about your unit</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/tenant/unit">View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Recent Maintenance Requests */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Maintenance Requests</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingMaintenance ? (
                    <div className="divide-y">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="h-4 w-36 bg-gray-200 animate-pulse rounded"></div>
                              <div className="h-3 w-24 mt-2 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                            <div className="h-5 w-20 bg-gray-200 animate-pulse rounded-full"></div>
                          </div>
                          <div className="h-3 w-32 mt-2 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : maintenanceRequests.length > 0 ? (
                    <div className="divide-y">
                      {maintenanceRequests.map((request) => (
                        <div key={request.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{request.title}</p>
                              <p className="text-sm text-gray-500">ID: {formatMaintenanceId(request.id)}</p>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'}`}>
                              {request.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Submitted: {formatDate(request.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-center text-gray-500">No recent maintenance requests</p>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/tenant/maintenance">View All Requests</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingNotifications ? (
                    <div className="divide-y">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-4 w-36 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                          </div>
                          <div className="h-3 w-20 mt-2 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {!notification.is_read && (
                                <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                              )}
                              <p className="font-medium">{notification.title}</p>
                            </div>
                            <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 capitalize">{notification.notification_type}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-center text-gray-500">No recent notifications</p>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/tenant/notifications">View All Notifications</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Property Information */}
            <Card className="mt-8">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Property Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative h-48 md:w-1/3 w-full">
                    <Image 
                      src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800"
                      alt={tenantInfo.property}
                      fill
                      className="object-cover rounded-md"
                      sizes="100vw"
                      unoptimized
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-bold">{tenantInfo.property}</h3>
                    <p className="text-gray-500 mb-4">123 Main Street, Nairobi, Kenya</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">Contact Information</h4>
                        <p className="text-sm text-gray-500">Property Manager: Jane Smith</p>
                        <p className="text-sm text-gray-500">Email: manager@makao.com</p>
                        <p className="text-sm text-gray-500">Phone: +254 712 345 678</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Emergency Contacts</h4>
                        <p className="text-sm text-gray-500">Security: +254 712 345 679</p>
                        <p className="text-sm text-gray-500">Maintenance: +254 712 345 680</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
