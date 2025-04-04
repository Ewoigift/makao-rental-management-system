"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, DollarSign, User, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export default function TenantLeasePage() {
  const [lease, setLease] = useState({
    id: "L-2025-001",
    propertyName: "Sunset Apartments",
    unitNumber: "A101",
    startDate: "2024-05-01",
    endDate: "2025-04-30",
    monthlyRent: "KES 25,000",
    securityDeposit: "KES 50,000",
    tenantName: "John Doe",
    landlordName: "Property Management LLC",
  });
  
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(true);

  // In a real app, this would fetch lease data from the database
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // In production, you would fetch real data:
    // async function fetchLeaseData() {
    //   const response = await fetch('/api/tenant/lease');
    //   const data = await response.json();
    //   setLease(data);
    //   setLoading(false);
    // }
    // fetchLeaseData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Lease</h1>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lease Agreement #{lease.id}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Property</h3>
                      <p className="flex items-center gap-2 mt-1">
                        <Home className="h-4 w-4 text-gray-500" />
                        {lease.propertyName}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Unit</h3>
                      <p className="mt-1">{lease.unitNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tenant</h3>
                      <p className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-500" />
                        {lease.tenantName}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Landlord</h3>
                      <p className="mt-1">{lease.landlordName}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Lease Term</h3>
                      <p className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formatDate(lease.startDate)} to {formatDate(lease.endDate)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Monthly Rent</h3>
                      <p className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        {lease.monthlyRent}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Security Deposit</h3>
                      <p className="mt-1">{lease.securityDeposit}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <div className="mt-1">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Lease Terms</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">1. Rent Payment</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Rent is due on the 1st of each month. A late fee of KES 2,000 will be applied after the 5th day.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">2. Utilities</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Tenant is responsible for electricity, water, and internet services. The landlord covers garbage collection.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">3. Maintenance</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Tenant should report maintenance issues promptly through the tenant portal.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">4. Notice Period</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        A 30-day written notice is required before vacating the premises or for lease renewal.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
