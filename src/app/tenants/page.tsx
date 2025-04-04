"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Search, Filter, Check, Mail, Phone } from "lucide-react";
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
import TenantDialog from "@/components/tenants/tenant-dialog";
import { Badge } from "@/components/ui/badge";

// Types based on Supabase schema
interface Tenant {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  profile_picture_url?: string;
  id_number?: string;
  created_at: string;
  updated_at: string;
  leases?: Lease[];
}

interface Lease {
  id: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  unit?: {
    id: string;
    unit_number: string;
    property_id: string;
    property?: {
      id: string;
      name: string;
      address: string;
    };
  };
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');

  // Fetch tenants from Supabase
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const { supabase } = await import('@/lib/supabase/client');
        
        // First try to fetch using clerk_id for newer users
        let { data, error } = await supabase
          .from('users')
          .select(`
            *,
            leases(*, unit:units(*, property:properties(id, name, address)))
          `)
          .or('role.eq.tenant,user_type.eq.tenant');
        
        // If no data or specific error, try alternative approach
        if (error) {
          console.warn('Initial fetch failed, trying alternate approach:', error);
          // Try just getting all users
          const { data: allUsers, error: allUsersError } = await supabase
            .from('users')
            .select('*');
            
          if (allUsersError) {
            throw allUsersError;
          }
          
          // Filter tenant users client-side
          data = allUsers.filter(user => 
            user.user_type === 'tenant' || user.role === 'tenant'
          );
          
          console.log('Fallback approach found:', data?.length, 'tenants');
        }
        
        if (data && data.length > 0) {
          console.log('Tenants data loaded:', data.length, 'tenants found');
          setTenants(data);
          setFilteredTenants(data);
        } else {
          console.log('No tenants found or access denied');
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTenants();
  }, []);
  
  // Sample data - commented out as we're using real data
  /*
  const demoTenants: Tenant[] = [
      {
        id: "t1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+254 712 345 678",
        unitNumber: "A101",
        propertyName: "Sunset Apartments",
        leaseStart: "2024-05-01",
        leaseEnd: "2025-04-30",
        status: "active",
        rentAmount: "KES 25,000",
      },
      {
        id: "t2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+254 723 456 789",
        unitNumber: "B201",
        propertyName: "Sunset Apartments",
        leaseStart: "2024-03-15",
        leaseEnd: "2025-03-14",
        status: "active",
        rentAmount: "KES 35,000",
      },
      {
        id: "t3",
        name: "Robert Johnson",
        email: "robert.j@example.com",
        phone: "+254 734 567 890",
        unitNumber: "C101",
        propertyName: "Riverside Homes",
        leaseStart: "2024-02-01",
        leaseEnd: "2025-01-31",
        status: "active",
        rentAmount: "KES 60,000",
      },
      {
        id: "t4",
        name: "Emily Wilson",
        email: "emily.w@example.com",
        phone: "+254 745 678 901",
        unitNumber: "D303",
        propertyName: "Hillview Residences",
        leaseStart: "2023-12-01",
        leaseEnd: "2024-05-31",
        status: "inactive",
        rentAmount: "KES 40,000",
      },
      {
        id: "t5",
        name: "Michael Brown",
        email: "michael.b@example.com",
        phone: "+254 756 789 012",
        unitNumber: "E105",
        propertyName: "Hillview Residences",
        leaseStart: "2025-05-01",
        leaseEnd: "2026-04-30",
        status: "pending",
        rentAmount: "KES 45,000",
      },
    ];
  */

    // In production:
    // async function fetchTenants() {
    //   try {
    //     const supabase = createSupabaseClient();
    //     const { data, error } = await supabase
    //       .from('leases')
    //       .select(`
    //         *,
    //         tenants(id, full_name, email, phone),
    //         units(unit_number, properties(name))
    //       `)
    //       .order('created_at', { ascending: false });
    //
    //     if (error) throw error;
    //     
    //     const formattedTenants = data.map(lease => ({
    //       id: lease.tenants.id,
    //       name: lease.tenants.full_name,
    //       email: lease.tenants.email,
    //       phone: lease.tenants.phone,
    //       unitNumber: lease.units.unit_number,
    //       propertyName: lease.units.properties.name,
    //       leaseStart: lease.start_date,
    //       leaseEnd: lease.end_date,
    //       status: lease.status,
    //       rentAmount: `KES ${lease.rent_amount.toLocaleString()}`
    //     }));
    //
    //     setTenants(formattedTenants);
    //     setFilteredTenants(formattedTenants);

  // Filter tenants based on status
  useEffect(() => {
    let results = filteredTenants;
    
    if (statusFilter) {
      // Filter by lease status
      results = results.filter(tenant => 
        tenant.leases?.some(lease => lease.status === statusFilter)
      );
    }
    
    setFilteredTenants(results);
  }, [statusFilter, filteredTenants]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Expired</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Terminated</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tenants</h1>
            <p className="text-gray-500">Manage your property tenants</p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedTenantId(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add New Tenant
          </Button>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email, unit, or property..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {statusFilter ? `Status: ${statusFilter}` : "Filter"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter(null)}
                      className="flex items-center justify-between"
                    >
                      All
                      {!statusFilter && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("active")}
                      className="flex items-center justify-between"
                    >
                      Active
                      {statusFilter === "active" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("inactive")}
                      className="flex items-center justify-between"
                    >
                      Inactive
                      {statusFilter === "inactive" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("pending")}
                      className="flex items-center justify-between"
                    >
                      Pending
                      {statusFilter === "pending" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No tenants found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border-b text-center w-12">#</th>
                    <th className="p-2 border-b text-left">Name</th>
                    <th className="p-2 border-b text-left">Email</th>
                    <th className="p-2 border-b text-left">Phone</th>
                    <th className="p-2 border-b text-left">Join Date</th>
                    <th className="p-2 border-b text-left">Unit</th>
                    <th className="p-2 border-b text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant, index) => (
                    <tr key={tenant.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 border-b text-center">
                        {index + 1}
                      </td>
                      <td className="p-2 border-b">
                        <div className="flex items-center gap-2">
                          {tenant.profile_picture_url ? (
                            <img 
                              src={tenant.profile_picture_url} 
                              alt={tenant.full_name} 
                              className="h-8 w-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {tenant.full_name?.charAt(0)?.toUpperCase() || "T"}
                            </div>
                          )}
                          <span className="font-medium">{tenant.full_name}</span>
                        </div>
                      </td>
                      <td className="p-2 border-b">
                        <a href={`mailto:${tenant.email}`} className="text-sm text-blue-600 hover:underline">
                          {tenant.email || 'N/A'}
                        </a>
                      </td>
                      <td className="p-2 border-b">
                        <span className="text-sm text-gray-600">{tenant.phone_number || 'N/A'}</span>
                      </td>
                      <td className="p-2 border-b">
                        <span className="text-sm">{formatDate(tenant.created_at)}</span>
                      </td>
                      <td className="p-2 border-b">
                        {tenant.leases && tenant.leases.length > 0 && tenant.leases[0].unit ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                              Allocated
                            </Badge>
                            <div className="text-sm">
                              <div>{tenant.leases[0].unit.unit_number}</div>
                              <div className="text-gray-500">{tenant.leases[0].unit.property?.name}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-100">
                              Not Allocated
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td className="p-2 border-b text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              Actions
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedTenantId(tenant.id);
                              setDialogMode('view');
                              setDialogOpen(true);
                            }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTenantId(tenant.id);
                              setDialogMode('edit');
                              setDialogOpen(true);
                            }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              Edit Tenant
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              Delete Tenant
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Tenant Dialog */}
      {dialogOpen && (
        <TenantDialog
          isOpen={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedTenantId(null);
          }}
          tenantId={selectedTenantId || undefined}
          mode={dialogMode}
          onTenantUpdated={() => {
            // Refresh the tenants list after a tenant is updated
            const fetchTenants = async () => {
              try {
                setLoading(true);
                const { supabase } = await import('@/lib/supabase/client');
                
                let { data, error } = await supabase
                  .from('users')
                  .select(`
                    *,
                    leases(*, unit:units(*, property:properties(id, name, address)))
                  `)
                  .or('role.eq.tenant,user_type.eq.tenant');
                
                if (error) {
                  console.warn('Fetch failed, trying alternate approach:', error);
                  const { data: allUsers, error: allUsersError } = await supabase
                    .from('users')
                    .select('*');
                    
                  if (allUsersError) throw allUsersError;
                  
                  data = allUsers.filter(user => 
                    user.user_type === 'tenant' || user.role === 'tenant'
                  );
                }
                
                if (data && data.length > 0) {
                  setTenants(data);
                  setFilteredTenants(data);
                }
              } catch (error) {
                console.error('Error fetching tenants:', error);
              } finally {
                setLoading(false);
              }
            };
            
            fetchTenants();
          }}
        />
      )}
    </MainLayout>
  );
}
