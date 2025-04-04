"use client";

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  CheckCircle, 
  XCircle, 
  MoreVertical, 
  Search, 
  FileText, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
// Using API endpoints instead of direct Supabase calls to avoid CORS issues
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  
  const { user } = useUser();
  
  // Fetch payments data using server-side API endpoint
  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/payments-simple');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch payments');
        }
        
        const data = await response.json();
        setPayments(data);
        setFilteredPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchPayments();
    }
  }, [user]);
  
  // Filter payments based on search term and status filter
  useEffect(() => {
    let filtered = payments;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.lease?.tenant?.full_name?.toLowerCase().includes(term) ||
        payment.lease?.unit?.unit_number?.toLowerCase().includes(term) ||
        payment.lease?.unit?.property?.name?.toLowerCase().includes(term) ||
        payment.receipt_number?.toLowerCase().includes(term) ||
        payment.transaction_id?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }
    
    setFilteredPayments(filtered);
  }, [searchTerm, statusFilter, payments]);
  
  // Handle payment verification using server-side API endpoint
  const handleVerifyPayment = async () => {
    if (!selectedPayment || !user?.id) return;
    
    setProcessingAction(true);
    try {
      const response = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify payment');
      }
      
      const result = await response.json();
      
      if (result) {
        // Update the payments list
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment.id === selectedPayment.id ? { ...payment, status: 'verified' } : payment
          )
        );
        toast.success('Payment verified successfully');
      } else {
        throw new Error('Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      setProcessingAction(false);
      setIsVerifyDialogOpen(false);
      setSelectedPayment(null);
    }
  };
  
  // Handle payment rejection using server-side API endpoint
  const handleRejectPayment = async () => {
    if (!selectedPayment || !user?.id || !rejectionReason) return;
    
    setProcessingAction(true);
    try {
      const response = await fetch('/api/admin/payments/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          reason: rejectionReason
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject payment');
      }
      
      const result = await response.json();
      
      if (result) {
        // Update the payments list
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment.id === selectedPayment.id ? { ...payment, status: 'rejected' } : payment
          )
        );
        toast.success('Payment rejected successfully');
      } else {
        throw new Error('Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    } finally {
      setProcessingAction(false);
      setIsRejectDialogOpen(false);
      setSelectedPayment(null);
      setRejectionReason('');
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `KSh ${parseFloat(amount).toLocaleString()}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Management</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="search"
                    placeholder="Search by tenant, unit, or receipt number..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="status" className="sr-only">Status</Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <FileText className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground mb-2">No payments found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Payments will appear here once tenants make them'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment, index) => (
                    <TableRow key={payment.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>{payment.lease?.tenant?.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        {payment.lease?.unit?.unit_number ? (
                          <div>
                            <span className="font-medium">Unit {payment.lease?.unit?.unit_number || 'N/A'}</span>
                            <br />
                            <span className="text-xs text-gray-500">{payment.lease?.unit?.property?.name || 'N/A'}</span>
                          </div>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>                      <TableCell>{payment.receipt_number || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {payment.status === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setIsVerifyDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Verify Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setIsRejectDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Reject Payment
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        {/* Verify Payment Dialog */}
        <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Payment</DialogTitle>
              <DialogDescription>
                Are you sure you want to verify this payment?
              </DialogDescription>
            </DialogHeader>
            
            {selectedPayment && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Tenant</Label>
                    <p className="font-medium">{selectedPayment.lease?.tenant?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Amount</Label>
                    <p className="font-medium">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Date</Label>
                    <p className="font-medium">{formatDate(selectedPayment.payment_date)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Receipt #</Label>
                    <p className="font-medium">{selectedPayment.receipt_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleVerifyPayment} 
                disabled={processingAction}
                className="bg-green-600 hover:bg-green-700"
              >
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Reject Payment Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payment</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this payment.
              </DialogDescription>
            </DialogHeader>
            
            {selectedPayment && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-gray-500">Tenant</Label>
                    <p className="font-medium">{selectedPayment.lease?.tenant?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Amount</Label>
                    <p className="font-medium">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Enter the reason for rejecting this payment..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRejectPayment} 
                disabled={processingAction || !rejectionReason}
                className="bg-red-600 hover:bg-red-700"
              >
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
