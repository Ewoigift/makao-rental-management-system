"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Search, PenToolIcon, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useUser } from '@clerk/nextjs';
import { getTenantMaintenanceRequests, MaintenanceRequest } from '@/lib/db/maintenance-utils';
import { formatDate } from '@/lib/utils/index';

export default function MaintenanceRequestsPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const { user } = useUser();
  
  // Fetch maintenance requests from database
  useEffect(() => {
    async function fetchMaintenanceRequests() {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        const requests = await getTenantMaintenanceRequests(user.id);
        setMaintenanceRequests(requests);
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchMaintenanceRequests();
    }
  }, [user]);
  
  // Filter and search maintenance requests
  const filteredRequests = maintenanceRequests.filter(request => {
    // Filter by status
    if (filter !== 'all' && request.status !== filter) {
      return false;
    }
    
    // Search by title or description
    if (searchQuery && !(
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    return true;
  });
  
  // Helper functions for formatting
  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const formatPriority = (priority: string) => {
    if (!priority) return 'Unknown';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Maintenance Requests</h1>
          <Link href="/tenant/maintenance/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : maintenanceRequests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground mb-4">You don't have any maintenance requests yet.</p>
              <Link href="/tenant/maintenance/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>My Requests</CardTitle>
                    <div className="flex space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search requests..."
                          className="pl-8 w-[200px] md:w-[300px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[130px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Requests</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="list" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="list">List View</TabsTrigger>
                      <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                    </TabsList>
                    <TabsContent value="list" className="mt-4">
                      <div className="space-y-4">
                        {filteredRequests.map((request) => (
                          <div key={request.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{request.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{request.description.substring(0, 100)}...</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground">{formatDate(request.created_at)}</span>
                                <span className={`mt-1 px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                                  {formatStatus(request.status)}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.priority)}`}>
                                  {formatPriority(request.priority)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800`}>
                                  {request.unit?.unit_number || 'Unknown Unit'}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`#${request.id}`}>View Details</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="detailed" className="mt-4">
                      <div className="space-y-6">
                        {filteredRequests.map((request) => (
                          <div key={request.id} id={request.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium">{request.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">ID: {request.id}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-sm text-muted-foreground">{formatDate(request.created_at)}</span>
                                <span className={`mt-1 px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                                  {formatStatus(request.status)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-sm font-medium">Issue Type</p>
                                <p className="text-sm">{request.title}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Priority</p>
                                <p className="text-sm">{formatPriority(request.priority)}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <p className="text-sm font-medium">Description</p>
                              <p className="text-sm mt-1">{request.description}</p>
                            </div>
                            
                            <div className="mt-6">
                              <p className="text-sm font-medium">Unit Information</p>
                              <div className="mt-2 space-y-3">
                                {request.unit && (
                                  <div className="bg-muted/50 p-3 rounded-md">
                                    <div className="flex justify-between items-start">
                                      <p className="text-sm">Unit: {request.unit.unit_number}</p>
                                      {request.unit.property && (
                                        <p className="text-sm">Property: {request.unit.property.name}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Reporting Issues</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be specific about the issue and include photos if possible when creating a new maintenance request.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Emergency Situations</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      For water leaks, gas smells, or electrical issues that pose immediate danger, please call the emergency line.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Access for Repairs</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Maintenance staff will coordinate with you for access to your unit. You'll be notified in advance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
