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
  Loader2,
  Plus,
  Calendar,
  Wrench,
  PenToolIcon
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

// Maintenance request type based on database schema
interface MaintenanceRequest {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  unit?: {
    id: string;
    unit_number: string;
    property?: {
      id: string;
      name: string;
    };
  };
}

export default function MaintenancePage() {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  
  const { user } = useUser();
  
  // Fetch maintenance requests using server-side API endpoint
  useEffect(() => {
    async function fetchMaintenanceRequests() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard/maintenance-simple');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch maintenance requests');
        }
        
        const data = await response.json();
        setMaintenanceRequests(data);
        setFilteredRequests(data);
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        toast.error('Failed to load maintenance requests');
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchMaintenanceRequests();
    }
  }, [user]);
  
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter maintenance requests based on search term and status filter
  useEffect(() => {
    let filtered = maintenanceRequests;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.title?.toLowerCase().includes(term) ||
        request.description?.toLowerCase().includes(term) ||
        request.unit?.unit_number?.toLowerCase().includes(term) ||
        request.unit?.property?.name?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, maintenanceRequests]);
  
  // Handle updating maintenance request status
  const handleUpdateStatus = async () => {
    if (!selectedRequest || !updateStatus) return;
    
    setProcessingAction(true);
    try {
      // In a real implementation, this would call an API endpoint to update the status
      // For now, we'll just update the local state
      setMaintenanceRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === selectedRequest.id ? { ...request, status: updateStatus } : request
        )
      );
      toast.success(`Maintenance request updated to ${updateStatus}`);
      setIsUpdateDialogOpen(false);
      setSelectedRequest(null);
      setUpdateStatus('');
      setUpdateNotes('');
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      toast.error('Failed to update maintenance request');
    } finally {
      setProcessingAction(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Maintenance Management</h1>
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
                    placeholder="Search by title, description, or unit..."
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
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Wrench className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground mb-2">No maintenance requests found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Maintenance requests will appear here once created'}
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
                    <TableHead>Title</TableHead>
                    <TableHead>Property/Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request, index) => (
                    <TableRow key={request.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {request.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.unit?.unit_number ? (
                          <div>
                            <span className="font-medium">Unit {request.unit?.unit_number || 'N/A'}</span>
                            <br />
                            <span className="text-xs text-gray-500">{request.unit?.property?.name || 'N/A'}</span>
                          </div>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsViewDetailsDialogOpen(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedRequest(request);
                                setUpdateStatus(request.status);
                                setIsUpdateDialogOpen(true);
                              }}
                            >
                              <PenToolIcon className="h-4 w-4 mr-2 text-blue-600" />
                              Update Status
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
        
        {/* View Details Dialog */}
        <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Maintenance Request Details</DialogTitle>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedRequest.title}</h3>
                  <Badge className="mt-1">{selectedRequest.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Property/Unit</Label>
                    <p className="font-medium">
                      {selectedRequest.unit?.property?.name ? `${selectedRequest.unit.property.name}, ` : ''}
                      Unit {selectedRequest.unit?.unit_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Date Submitted</Label>
                    <p className="font-medium">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Description</Label>
                  <p className="mt-1">{selectedRequest.description}</p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Update Status Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Maintenance Status</DialogTitle>
              <DialogDescription>
                Change the status of this maintenance request.
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4 py-2">
                <div>
                  <h3 className="font-semibold">{selectedRequest.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedRequest.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    <option value="">Select a status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this status update..."
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStatus} 
                disabled={processingAction || !updateStatus}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Update Status
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
