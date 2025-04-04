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

  // Fetch tenants from Supabase
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const { supabase } = await import('@/lib/supabase/client');
        
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            leases(*, unit:units(*, property:properties(id, name, address)))
          `)
          .eq('user_type', 'tenant');
        
        if (error) throw error;
        
        if (data) {
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
  }, []);
  
  // Sample data - uncomment if needed during development
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
    //   } catch (error) {
    //     console.error('Error fetching tenants:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    //
    // fetchTenants();
  // }, []);

  // Filter tenants based on search and status
  useEffect(() => {
    let results = tenants;
    
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(tenant => 
        (tenant.full_name?.toLowerCase() || '').includes(lowercaseQuery) ||
        (tenant.email?.toLowerCase() || '').includes(lowercaseQuery) ||
        (tenant.phone_number?.toLowerCase() || '').includes(lowercaseQuery) ||
        tenant.leases?.some(lease => 
          (lease.unit?.unit_number?.toLowerCase() || '').includes(lowercaseQuery) ||
          (lease.unit?.property?.name?.toLowerCase() || '').includes(lowercaseQuery)
        )
      );
    }
    
    if (statusFilter) {
      // Filter by lease status
      results = results.filter(tenant => 
        tenant.leases?.some(lease => lease.status === statusFilter)
      );
    }
    
    setFilteredTenants(results);
  }, [searchQuery, statusFilter, tenants]);

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
          <Button className="flex items-center gap-2">
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
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Contact</th>
                    <th className="text-left p-4 font-medium">Unit</th>
                    <th className="text-left p-4 font-medium">Property</th>
                    <th className="text-left p-4 font-medium">Lease Period</th>
                    <th className="text-left p-4 font-medium">Rent</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b hover:bg-muted/50">
                       <td className="p-4 font-medium">{tenant.full_name || 'N/A'}</td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <a href={`mailto:${tenant.email}`} className="text-sm text-blue-600 hover:underline">
                              {tenant.email || 'N/A'}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span className="text-sm text-gray-600">{tenant.phone_number || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {tenant.leases && tenant.leases.length > 0 ? 
                          tenant.leases[0].unit?.unit_number || 'N/A' : 'No unit'}
                      </td>
                      <td className="p-4">
                        {tenant.leases && tenant.leases.length > 0 ? 
                          tenant.leases[0].unit?.property?.name || 'N/A' : 'No property'}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {tenant.leases && tenant.leases.length > 0 ? 
                            `${formatDate(tenant.leases[0].start_date)} — ${formatDate(tenant.leases[0].end_date)}` : 'No lease'}
                        </div>
                      </td>
                      <td className="p-4">
                        {tenant.leases && tenant.leases.length > 0 ? 
                          `$${tenant.leases[0].rent_amount.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="p-4">
                        {tenant.leases && tenant.leases.length > 0 ? 
                          getStatusBadge(tenant.leases[0].status) : 
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">No lease</Badge>}
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
