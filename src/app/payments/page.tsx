"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  CreditCard, 
  Clock, 
  Banknote,
  CheckCircle2,
  XCircle,
  Home,
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

// Types based on Supabase schema
interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: 'paid' | 'pending' | 'late' | 'failed';
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  lease?: {
    id: string;
    unit_id: string;
    tenant_id: string;
    rent_amount: number;
    unit?: {
      id: string;
      unit_number: string;
      property?: {
        id: string;
        name: string;
      };
    };
    tenant?: {
      id: string;
      full_name: string;
      email: string;
    };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch payments from Supabase
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { getAllPayments } = await import('@/lib/db/api-operations');
        const data = await getAllPayments();
        
        if (data) {
          setPayments(data);
          setFilteredPayments(data);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, []);

  // Filter payments based on search and status
  useEffect(() => {
    let results = payments;
    
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(payment => 
        (payment.lease?.tenant?.full_name?.toLowerCase() || '').includes(lowercaseQuery) ||
        (payment.lease?.unit?.unit_number?.toLowerCase() || '').includes(lowercaseQuery) ||
        (payment.lease?.unit?.property?.name?.toLowerCase() || '').includes(lowercaseQuery) ||
        (payment.payment_method?.toLowerCase() || '').includes(lowercaseQuery) ||
        (payment.transaction_id?.toLowerCase() || '').includes(lowercaseQuery)
      );
    }
    
    if (statusFilter) {
      results = results.filter(payment => payment.status === statusFilter);
    }
    
    setFilteredPayments(results);
  }, [searchQuery, statusFilter, payments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'late':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Late</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payments</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Payment Management</CardTitle>
            <div className="flex items-center justify-between mt-2">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search payments..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                      <Check className={`mr-2 h-4 w-4 ${!statusFilter ? "opacity-100" : "opacity-0"}`} />
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("paid")}>
                      <Check className={`mr-2 h-4 w-4 ${statusFilter === "paid" ? "opacity-100" : "opacity-0"}`} />
                      Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                      <Check className={`mr-2 h-4 w-4 ${statusFilter === "pending" ? "opacity-100" : "opacity-0"}`} />
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("late")}>
                      <Check className={`mr-2 h-4 w-4 ${statusFilter === "late" ? "opacity-100" : "opacity-0"}`} />
                      Late
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                      <Check className={`mr-2 h-4 w-4 ${statusFilter === "failed" ? "opacity-100" : "opacity-0"}`} />
                      Failed
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">Loading payments...</p>
                </div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center p-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-xl font-semibold">No payments found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter
                    ? "Try changing your search or filter"
                    : "Record your first payment to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">ID/Reference</th>
                    <th className="text-left p-4 font-medium">Tenant</th>
                    <th className="text-left p-4 font-medium">Unit</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Method</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">#{payment.id.substring(0, 8)}</div>
                        <div className="text-xs text-gray-500">
                          {payment.transaction_id ? payment.transaction_id : 'No reference'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-gray-500" />
                          {payment.lease?.tenant?.full_name || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4 text-gray-500" />
                          {payment.lease?.unit?.unit_number || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.lease?.unit?.property?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {formatDate(payment.payment_date)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Banknote className="h-4 w-4 text-gray-500" />
                          {payment.payment_method || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
