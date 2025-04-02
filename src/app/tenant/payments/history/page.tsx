import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PaymentHistoryPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample payment history data - would come from database
  const allPayments = [
    { 
      id: 'PAY-2025-042', 
      date: '2025-04-01', 
      amount: 'KES 25,000', 
      type: 'Rent', 
      month: 'April 2025',
      method: 'M-Pesa', 
      reference: 'MPESA-XYZ123', 
      status: 'verified' 
    },
    { 
      id: 'PAY-2025-031', 
      date: '2025-03-01', 
      amount: 'KES 25,000', 
      type: 'Rent', 
      month: 'March 2025',
      method: 'Bank Transfer', 
      reference: 'BANK-ABC456', 
      status: 'verified' 
    },
    { 
      id: 'PAY-2025-021', 
      date: '2025-02-03', 
      amount: 'KES 25,000', 
      type: 'Rent', 
      month: 'February 2025',
      method: 'M-Pesa', 
      reference: 'MPESA-DEF789', 
      status: 'verified' 
    },
    { 
      id: 'PAY-2025-011', 
      date: '2025-01-02', 
      amount: 'KES 25,000', 
      type: 'Rent', 
      month: 'January 2025',
      method: 'Credit Card', 
      reference: 'CARD-GHI012', 
      status: 'verified' 
    },
    { 
      id: 'PAY-2024-121', 
      date: '2024-12-01', 
      amount: 'KES 25,000', 
      type: 'Rent', 
      month: 'December 2024',
      method: 'M-Pesa', 
      reference: 'MPESA-JKL345', 
      status: 'verified' 
    },
    { 
      id: 'PAY-2024-111', 
      date: '2024-11-05', 
      amount: 'KES 25,000', 
      type: 'Rent', 
      month: 'November 2024',
      method: 'Bank Transfer', 
      reference: 'BANK-MNO678', 
      status: 'verified' 
    },
    { 
      id: 'PAY-2024-101', 
      date: '2024-10-02', 
      amount: 'KES 5,000', 
      type: 'Utilities', 
      month: 'October 2024',
      method: 'M-Pesa', 
      reference: 'MPESA-PQR901', 
      status: 'verified' 
    },
  ];
  
  // Filter payments based on selected filter and search query
  const filteredPayments = allPayments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Get payment status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        
        {/* Payment history table */}
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
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{payment.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{payment.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{payment.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{payment.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{payment.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{payment.method}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{payment.reference}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
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
                      <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                        No payment records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Payments (2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 100,000</div>
              <p className="text-xs text-gray-500 mt-1">4 payments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Latest Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 25,000</div>
              <p className="text-xs text-gray-500 mt-1">April 1, 2025</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Next Payment Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 25,000</div>
              <p className="text-xs text-gray-500 mt-1">May 1, 2025</p>
            </CardContent>
          </Card>
        </div>
        
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
