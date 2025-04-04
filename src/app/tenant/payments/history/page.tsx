"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, Search, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getTenantPayments, Payment } from '@/lib/db/payments-utils';
import { formatDate } from '@/lib/utils/index';
import { MainLayout } from '@/components/layout/main-layout';

export default function PaymentHistoryPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  
  // Fetch payments from database
  useEffect(() => {
    async function fetchPayments() {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        setError(null);
        const paymentData = await getTenantPayments(user.id);
        setPayments(paymentData);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payment history. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchPayments();
    }
  }, [user]);
  
  // Filter payments based on selected filter and search query
  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = searchQuery === '' || (
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.lease?.unit?.property?.name && 
        payment.lease.unit.property.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    return matchesFilter && matchesSearch;
  });

  // Get payment status badge color
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format payment status
  const formatStatus = (status: string) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  // Format payment type
  const getPaymentType = (payment: Payment) => {
    return 'Rent';
  };
  
  // Format payment month
  const getPaymentMonth = (payment: Payment) => {
    const date = new Date(payment.payment_date);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Calculate payment summary
  const calculatePaymentSummary = () => {
    if (payments.length === 0) {
      return {
        totalAmount: 0,
        totalCount: 0,
        latestPayment: { amount: 0, date: 'N/A' },
        nextDueDate: 'N/A'
      };
    }
    
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const sortedPayments = [...payments].sort((a, b) => 
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
    
    const latestPayment = sortedPayments[0];
    const latestDate = new Date(latestPayment.payment_date);
    
    // Calculate next due date (assume monthly payments, due on the same day of next month)
    const nextDueDate = new Date(latestDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    
    return {
      totalAmount,
      totalCount: payments.length,
      latestPayment: {
        amount: latestPayment.amount,
        date: formatDate(latestPayment.payment_date)
      },
      nextDueDate: formatDate(nextDueDate.toISOString())
    };
  };
  
  const paymentSummary = calculatePaymentSummary();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Payment History</h1>
            <p className="text-gray-500">View and download your payment records</p>
          </div>
          <Button asChild>
            <Link href="/tenant/payments/make">Make a Payment</Link>
          </Button>
        </div>
        
        {/* Payment summary cards - moved to top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Payments ({new Date().getFullYear()})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {paymentSummary.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">{paymentSummary.totalCount} payments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Latest Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {paymentSummary.latestPayment.amount.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">{paymentSummary.latestPayment.date}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Next Payment Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {payments.length > 0 ? payments[0].amount.toLocaleString() : '0'}</div>
              <p className="text-xs text-gray-500 mt-1">{paymentSummary.nextDueDate}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search payments..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-10 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Payment Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{payment.id.substring(0, 10)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.payment_date)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">KSh {payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getPaymentType(payment)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getPaymentMonth(payment)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{payment.payment_method}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{payment.reference_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(payment.status)}`}>
                              {formatStatus(payment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download receipt</span>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                        {payments.length === 0 ? 'No payment history found.' : 'No payments found matching your filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        )
      }
        

        
        {/* Payment instructions */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">Need help with payments?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Contact our support team for assistance with payment methods, receipts, or any other payment-related questions.
                </p>
              </div>
              <Button variant="outline" className="bg-white">
                <Link href="/tenant/support">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
