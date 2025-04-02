import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Search, Tool, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function MaintenanceRequestsPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample maintenance requests data - would come from database
  const allRequests = [
    { 
      id: 'MR-2025-042', 
      date: '2025-03-28', 
      category: 'plumbing', 
      title: 'Leaking Faucet in Kitchen', 
      description: 'The kitchen sink faucet is leaking water continuously, even when turned off completely.',
      priority: 'normal',
      status: 'in_progress',
      updates: [
        { date: '2025-03-28', message: 'Request received and assigned to maintenance team.' },
        { date: '2025-03-29', message: 'Scheduled for inspection on April 3rd, between 10am-12pm.' }
      ]
    },
    { 
      id: 'MR-2025-036', 
      date: '2025-03-15', 
      category: 'electrical', 
      title: 'Electrical Outlet Not Working', 
      description: 'The electrical outlet in the living room near the window is not working.',
      priority: 'high',
      status: 'completed',
      updates: [
        { date: '2025-03-15', message: 'Request received and assigned to maintenance team.' },
        { date: '2025-03-16', message: 'Scheduled for inspection on March 17th, between 2pm-4pm.' },
        { date: '2025-03-17', message: 'Electrician found a faulty circuit and replaced it. Outlet is now working properly.' }
      ]
    },
    { 
      id: 'MR-2025-031', 
      date: '2025-03-10', 
      category: 'appliance', 
      title: 'Refrigerator Not Cooling', 
      description: 'The refrigerator is not cooling properly. Food is spoiling quickly.',
      priority: 'high',
      status: 'completed',
      updates: [
        { date: '2025-03-10', message: 'Request received and assigned to maintenance team.' },
        { date: '2025-03-11', message: 'Technician will visit on March 12th, between 9am-11am.' },
        { date: '2025-03-12', message: 'Technician found a faulty compressor. Refrigerator has been replaced with a new unit.' }
      ]
    },
    { 
      id: 'MR-2025-025', 
      date: '2025-02-28', 
      category: 'hvac', 
      title: 'Air Conditioner Not Cooling', 
      description: 'The air conditioner is running but not cooling the room effectively.',
      priority: 'normal',
      status: 'completed',
      updates: [
        { date: '2025-02-28', message: 'Request received and assigned to maintenance team.' },
        { date: '2025-03-01', message: 'HVAC technician will visit on March 3rd, between 1pm-3pm.' },
        { date: '2025-03-03', message: 'Technician cleaned the filters and recharged the refrigerant. AC is now working properly.' }
      ]
    },
    { 
      id: 'MR-2025-018', 
      date: '2025-02-15', 
      category: 'structural', 
      title: 'Ceiling Water Stain', 
      description: 'There is a water stain on the bathroom ceiling that appears to be growing.',
      priority: 'high',
      status: 'completed',
      updates: [
        { date: '2025-02-15', message: 'Request received and assigned to maintenance team.' },
        { date: '2025-02-16', message: 'Inspection scheduled for February 17th.' },
        { date: '2025-02-17', message: 'Inspection found a leak in the unit above. Repairs have been scheduled.' },
        { date: '2025-02-20', message: 'Leak has been fixed and ceiling has been repaired and repainted.' }
      ]
    },
    { 
      id: 'MR-2025-010', 
      date: '2025-01-28', 
      category: 'pest', 
      title: 'Ant Infestation in Kitchen', 
      description: 'There are ants in the kitchen, primarily around the sink area.',
      priority: 'normal',
      status: 'completed',
      updates: [
        { date: '2025-01-28', message: 'Request received and assigned to pest control team.' },
        { date: '2025-01-30', message: 'Pest control treatment scheduled for February 1st.' },
        { date: '2025-02-01', message: 'Pest control treatment completed. Follow-up scheduled in two weeks.' },
        { date: '2025-02-15', message: 'Follow-up inspection found no signs of ants. Issue resolved.' }
      ]
    },
  ];
  
  // Filter requests based on selected filter and search query
  const filteredRequests = allRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = 
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch(priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'emergency':
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
            <h1 className="text-3xl font-bold">Maintenance Requests</h1>
            <p className="text-gray-500">View and track your maintenance requests</p>
          </div>
          <Button asChild>
            <Link href="/tenant/maintenance/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>
        
        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search requests..."
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
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Maintenance requests */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        request.category === 'plumbing' ? 'bg-blue-100' :
                        request.category === 'electrical' ? 'bg-yellow-100' :
                        request.category === 'appliance' ? 'bg-green-100' :
                        request.category === 'hvac' ? 'bg-purple-100' :
                        request.category === 'structural' ? 'bg-orange-100' :
                        request.category === 'pest' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        <Tool className={`h-5 w-5 ${
                          request.category === 'plumbing' ? 'text-blue-600' :
                          request.category === 'electrical' ? 'text-yellow-600' :
                          request.category === 'appliance' ? 'text-green-600' :
                          request.category === 'hvac' ? 'text-purple-600' :
                          request.category === 'structural' ? 'text-orange-600' :
                          request.category === 'pest' ? 'text-red-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {request.id} • {request.date} • <span className="capitalize">{request.category}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(request.priority)}`}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                      </span>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                        {request.status === 'in_progress' ? 'In Progress' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details">
                    <TabsList>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="updates">Updates ({request.updates.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="pt-4">
                      <p className="text-sm">{request.description}</p>
                    </TabsContent>
                    <TabsContent value="updates" className="pt-4">
                      <div className="space-y-4">
                        {request.updates.map((update, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <p className="text-sm font-medium">{update.date}</p>
                            <p className="text-sm text-gray-600">{update.message}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-gray-100 p-6 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <Tool className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="font-medium text-lg">No maintenance requests found</h3>
              <p className="text-gray-500 mt-1">
                {searchQuery || filter !== 'all' ? 
                  'Try adjusting your search or filter criteria' : 
                  'You haven\'t submitted any maintenance requests yet'}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/tenant/maintenance/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit New Request
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Maintenance tips */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <h3 className="font-medium text-blue-800 mb-2">Maintenance Tips</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>For emergency maintenance issues (e.g., water leaks, no electricity), please call the emergency maintenance line at +254 712 345 680.</li>
              <li>Regular maintenance requests are typically addressed within 48-72 hours.</li>
              <li>Please be as detailed as possible when describing your maintenance issue.</li>
              <li>Photos help our maintenance team prepare for the repair and bring the right tools and parts.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
