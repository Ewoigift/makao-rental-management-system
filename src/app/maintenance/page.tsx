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
  
  // Statistics states
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    avgResolutionTime: 0,
    urgentCount: 0
  });
  
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
  
  // Calculate statistics based on maintenance requests
  useEffect(() => {
    if (maintenanceRequests.length > 0) {
      // Count by status
      const pending = maintenanceRequests.filter(req => req.status === 'pending').length;
      const inProgress = maintenanceRequests.filter(req => req.status === 'in_progress').length;
      const completed = maintenanceRequests.filter(req => req.status === 'completed').length;
      const cancelled = maintenanceRequests.filter(req => req.status === 'cancelled').length;
      
      // Count high priority/urgent requests
      const urgentCount = maintenanceRequests.filter(req => 
        req.priority === 'high' || req.priority === 'urgent'
      ).length;
      
      // Calculate average resolution time for completed requests (in days)
      let totalResolutionDays = 0;
      const completedWithDates = maintenanceRequests.filter(req => 
        req.status === 'completed' && req.created_at && req.completed_at
      );
      
      if (completedWithDates.length > 0) {
        completedWithDates.forEach(req => {
          const createdDate = new Date(req.created_at);
          const completedDate = new Date(req.completed_at!);
          const diffTime = Math.abs(completedDate.getTime() - createdDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalResolutionDays += diffDays;
        });
      }
      
      const avgResolutionTime = completedWithDates.length > 0 
        ? Math.round(totalResolutionDays / completedWithDates.length) 
        : 0;
      
      setStatistics({
        total: maintenanceRequests.length,
        pending,
        inProgress,
        completed,
        cancelled,
        avgResolutionTime,
        urgentCount
      });
    }
  }, [maintenanceRequests]);
  
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
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> New Request
          </Button>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-3xl font-bold text-blue-800">{statistics.total}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">All maintenance requests</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-amber-600 mr-2" />
                <span className="text-3xl font-bold text-amber-800">{statistics.pending}</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">Waiting for action</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-3xl font-bold text-green-800">{statistics.completed}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Successfully resolved</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Avg. Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600 mr-2" />
                <span className="text-3xl font-bold text-purple-800">{statistics.avgResolutionTime}</span>
                <span className="text-md ml-1 text-purple-700">days</span>
              </div>
              <p className="text-xs text-purple-600 mt-1">Average time to resolve</p>
            </CardContent>
          </Card>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-primary" />
                Maintenance Request Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-5">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">{selectedRequest.title}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedRequest.status)}
                    
                    {selectedRequest.priority && (
                      <Badge variant="outline" className={`
                        ${selectedRequest.priority === 'urgent' ? 'bg-red-100 text-red-800' : ''}
                        ${selectedRequest.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                        ${selectedRequest.priority === 'medium' ? 'bg-blue-100 text-blue-800' : ''}
                        ${selectedRequest.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                      `}>
                        {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)} Priority
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Property/Unit</Label>
                    <p className="font-medium">
                      {selectedRequest.unit?.property?.name ? `${selectedRequest.unit.property.name}, ` : ''}
                      Unit {selectedRequest.unit?.unit_number || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Status Timeline</Label>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">{formatDate(selectedRequest.created_at)}</span>
                      </div>
                      {selectedRequest.updated_at && selectedRequest.updated_at !== selectedRequest.created_at && (
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span className="font-medium">{formatDate(selectedRequest.updated_at)}</span>
                        </div>
                      )}
                      {selectedRequest.completed_at && (
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span className="font-medium">{formatDate(selectedRequest.completed_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 border-t pt-4">
                  <Label className="text-sm font-medium">Description</Label>
                  <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{selectedRequest.description}</div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsViewDetailsDialogOpen(false)}>
                Close
              </Button>
              {selectedRequest && selectedRequest.status !== 'completed' && selectedRequest.status !== 'cancelled' && (
                <Button 
                  onClick={() => {
                    setSelectedRequest(selectedRequest);
                    setUpdateStatus(selectedRequest.status);
                    setIsViewDetailsDialogOpen(false);
                    setIsUpdateDialogOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <PenToolIcon className="mr-2 h-4 w-4" /> Update Status
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Update Status Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <PenToolIcon className="h-5 w-5 mr-2 text-blue-600" />
                Update Maintenance Status
              </DialogTitle>
              <DialogDescription>
                Change the status of this maintenance request and add notes.
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4 py-2">
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <h3 className="font-semibold text-blue-900">{selectedRequest.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-blue-700">
                      Unit {selectedRequest.unit?.unit_number || 'N/A'}
                    </p>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">New Status</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      type="button" 
                      variant={updateStatus === 'pending' ? 'default' : 'outline'}
                      className={updateStatus === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                      onClick={() => setUpdateStatus('pending')}
                    >
                      Pending
                    </Button>
                    <Button 
                      type="button" 
                      variant={updateStatus === 'in_progress' ? 'default' : 'outline'}
                      className={updateStatus === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                      onClick={() => setUpdateStatus('in_progress')}
                    >
                      In Progress
                    </Button>
                    <Button 
                      type="button" 
                      variant={updateStatus === 'completed' ? 'default' : 'outline'}
                      className={updateStatus === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}
                      onClick={() => setUpdateStatus('completed')}
                    >
                      Completed
                    </Button>
                    <Button 
                      type="button" 
                      variant={updateStatus === 'cancelled' ? 'default' : 'outline'}
                      className={updateStatus === 'cancelled' ? 'bg-red-500 hover:bg-red-600' : ''}
                      onClick={() => setUpdateStatus('cancelled')}
                    >
                      Cancelled
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="notes" className="text-sm font-medium">Maintenance Notes</Label>
                    <span className="text-xs text-gray-500">{updateNotes.length}/500</span>
                  </div>
                  <Textarea
                    id="notes"
                    placeholder="Add details about the maintenance work performed or reasons for status change..."
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="resize-none"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStatus} 
                disabled={processingAction || !updateStatus}
                className={`
                  ${updateStatus === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                  ${updateStatus === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                  ${updateStatus === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}
                  ${updateStatus === 'cancelled' ? 'bg-red-500 hover:bg-red-600' : ''}
                  ${!updateStatus ? 'bg-gray-500' : ''}
                `}
              >
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {updateStatus === 'completed' && <CheckCircle className="mr-2 h-4 w-4" />}
                    {updateStatus === 'in_progress' && <PenToolIcon className="mr-2 h-4 w-4" />}
                    {updateStatus === 'pending' && <AlertCircle className="mr-2 h-4 w-4" />}
                    {updateStatus === 'cancelled' && <XCircle className="mr-2 h-4 w-4" />}
                    {!updateStatus && <PenToolIcon className="mr-2 h-4 w-4" />}
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
