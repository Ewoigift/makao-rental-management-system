"use client";

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Receipt, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLandlordDashboardSummary } from '@/lib/db/api-utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    propertyCount: 0,
    tenantCount: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from the database
    // Simulating API call for demo purposes
    setTimeout(() => {
      setDashboardData({
        propertyCount: 12,
        tenantCount: 48,
        monthlyRevenue: 480000,
        occupancyRate: 85
      });
      setLoading(false);
    }, 800);

    // In production, uncomment this:
    // async function fetchDashboardData() {
    //   try {
    //     const data = await getLandlordDashboardSummary();
    //     setDashboardData(data);
    //   } catch (error) {
    //     console.error('Error fetching dashboard data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Properties',
      value: dashboardData.propertyCount.toString(),
      icon: Building2,
      description: 'Active properties under management',
      link: '/properties'
    },
    {
      title: 'Total Tenants',
      value: dashboardData.tenantCount.toString(),
      icon: Users,
      description: 'Currently occupied units',
      link: '/tenants'
    },
    {
      title: 'Monthly Revenue',
      value: `KES ${dashboardData.monthlyRevenue.toLocaleString()}`,
      icon: Receipt,
      description: 'Expected monthly rent',
      link: '/payments'
    },
    {
      title: 'Occupancy Rate',
      value: `${dashboardData.occupancyRate}%`,
      icon: TrendingUp,
      description: 'Current occupancy rate',
      link: '/units'
    }
  ];

  // Recent activities (would come from database in production)
  const recentActivities = [
    {
      id: 'a1',
      title: 'New Tenant Registered',
      description: 'Michael Brown has registered for unit E105',
      timestamp: '2025-04-03T14:30:00Z',
      type: 'tenant'
    },
    {
      id: 'a2',
      title: 'Maintenance Request',
      description: 'Unit B202 reported a leaking faucet',
      timestamp: '2025-04-02T09:15:00Z',
      type: 'maintenance'
    },
    {
      id: 'a3',
      title: 'Payment Received',
      description: 'John Doe paid KES 25,000 for May rent',
      timestamp: '2025-04-01T10:45:00Z',
      type: 'payment'
    },
    {
      id: 'a4',
      title: 'Lease Expiring Soon',
      description: 'Emily Wilson\'s lease expires in 30 days',
      timestamp: '2025-03-30T16:20:00Z',
      type: 'lease'
    }
  ];

  // Properties with vacant units (would come from database in production)
  const propertiesWithVacancies = [
    {
      id: 'p1',
      name: 'Sunset Apartments',
      vacant: 2,
      total: 10,
      location: 'Westlands'
    },
    {
      id: 'p2',
      name: 'Riverside Homes',
      vacant: 1,
      total: 6,
      location: 'Lavington'
    },
    {
      id: 'p3',
      name: 'Hillview Residences',
      vacant: 3,
      total: 12,
      location: 'Kilimani'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'tenant':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'payment':
        return <Receipt className="h-5 w-5 text-green-500" />;
      case 'lease':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline">Generate Report</Button>
            <Button>Add Property</Button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="opacity-70">
                <CardHeader className="pb-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Link href={stat.link} key={stat.title}>
                <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-5 w-5 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="flex gap-4 items-start pb-4 border-b last:border-0">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Vacancies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {propertiesWithVacancies.map(property => (
                    <div key={property.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{property.name}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {property.vacant} vacant
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{property.location}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${((property.total - property.vacant) / property.total) * 100}%` || '0%' }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>{property.total - property.vacant} occupied</span>
                        <span>{property.total} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
