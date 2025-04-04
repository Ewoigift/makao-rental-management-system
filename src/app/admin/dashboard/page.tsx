"use client";

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Receipt, TrendingUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLandlordDashboardSummary } from '@/lib/db/api-utils';
import { createSupabaseClient } from '@/lib/auth/auth-utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    propertyCount: 0,
    tenantCount: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Get real data from Supabase
        const data = await getLandlordDashboardSummary();
        if (data) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Just show zeros if there's an error
        setDashboardData({
          propertyCount: 0,
          tenantCount: 0,
          monthlyRevenue: 0,
          occupancyRate: 0
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // State for maintenance requests and payments
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // Fetch maintenance requests
  useEffect(() => {
    async function fetchMaintenanceRequests() {
      try {
        setLoadingMaintenance(true);
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from('maintenance_requests')
          .select('id, unit_id, issue, status, created_at, units(unit_number)')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        setMaintenanceRequests(data || []);
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        setMaintenanceRequests([]);
      } finally {
        setLoadingMaintenance(false);
      }
    }
    
    fetchMaintenanceRequests();
  }, []);

  // Fetch recent payments
  useEffect(() => {
    async function fetchRecentPayments() {
      try {
        setLoadingPayments(true);
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from('payments')
          .select('id, amount, payment_date, status, tenants(full_name), units(unit_number)')
          .order('payment_date', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        setRecentPayments(data || []);
      } catch (error) {
        console.error('Error fetching recent payments:', error);
        setRecentPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    }
    
    fetchRecentPayments();
  }, []);

  return (
    <MainLayout>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Alerts
            </Button>
            <Button variant="outline" size="sm">
              <Receipt className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Properties Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-500 mr-2" />
                  <span className="text-3xl font-bold">{dashboardData.propertyCount}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tenants Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-500 mr-2" />
                  <span className="text-3xl font-bold">{dashboardData.tenantCount}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Revenue Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-36 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-500 mr-2" />
                  <span className="text-3xl font-bold">
                    KES {dashboardData.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Occupancy Rate Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Occupancy Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-amber-500 mr-2" />
                  <span className="text-3xl font-bold">{dashboardData.occupancyRate}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Maintenance Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingMaintenance ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start p-3 bg-gray-50 rounded-lg animate-pulse">
                        <div className="p-2 rounded-full mr-3 bg-gray-200 h-9 w-9"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : maintenanceRequests.length > 0 ? (
                  maintenanceRequests.map((request) => (
                    <div key={request.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full mr-3 
                        ${request.status === 'pending' ? 'bg-amber-100' : 
                          request.status === 'in_progress' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {request.status === 'pending' ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : request.status === 'in_progress' ? (
                          <AlertTriangle className="h-5 w-5 text-blue-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{request.issue}</h4>
                          <span className="text-sm text-gray-500">Unit {request.units?.unit_number}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-gray-500">#{request.id.slice(0, 8)}</span>
                          <span className="text-sm text-gray-500">{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No maintenance requests yet
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/maintenance">View All Maintenance Requests</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingPayments ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start p-3 bg-gray-50 rounded-lg animate-pulse">
                        <div className="p-2 rounded-full mr-3 bg-gray-200 h-9 w-9"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentPayments.length > 0 ? (
                  recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 rounded-full bg-green-100 mr-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{payment.tenants?.full_name || 'Tenant'}</h4>
                          <span className="font-medium text-green-600">
                            KES {payment.amount?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-gray-500">Unit {payment.units?.unit_number}</span>
                          <span className="text-sm text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No payment records found
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/payments">View All Payments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
