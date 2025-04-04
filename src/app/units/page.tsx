"use client";

import { MainLayout } from "@/components/layout/main-layout";
import UnitModal from "@/components/units/unit-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Plus, Search, Filter, Check, X, User } from "lucide-react";
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
import { formatKSh } from "@/lib/utils/currency";
import UnitAllocation from "@/components/units/unit-allocation";
import { Badge } from "@/components/ui/badge";

// Types based on Supabase schema
interface Unit {
  id: string;
  unit_number: string;
  property_id: string;
  property?: {
    id: string;
    name: string;
    address: string;
    property_type: string;
  };
  floor_number?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  rent_amount: number;
  deposit_amount: number;
  status: 'vacant' | 'occupied' | 'maintenance' | 'renovation';
  features?: any;
  images?: string[];
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUnitId, setEditUnitId] = useState<string | null>(null);
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Array<{id: string, name: string}>>([]);

  // Fetch units and properties from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { supabase } = await import('@/lib/supabase/client');
        
        // Fetch units with property details
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select(`
            *,
            property:properties(id, name, address, property_type)
          `);
          
        if (unitsError) throw unitsError;
        
        if (unitsData) {
          setUnits(unitsData);
          setFilteredUnits(unitsData);
        }
        
        // Fetch properties for the dropdown in the unit modal
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, name');
          
        if (propertiesError) throw propertiesError;
        
        if (propertiesData) {
          setProperties(propertiesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Reference for mock data and alternative implementation:
  /*
  // Example mock data structure
  const demoUnits: Unit[] = [
    {
      id: "u1",
      unit_number: "A101",
      property_id: "p1",
      property: {
        id: "p1",
        name: "Sunset Apartments",
        address: "123 Main St",
        property_type: "Apartment"
      },
      bedrooms: 2,
      bathrooms: 1,
      square_feet: 800,
      rent_amount: 25000,
      deposit_amount: 25000,
      status: "occupied",
    },
    // More units...
  ];

  // Simulate API loading delay example:
  // setTimeout(() => {
  //   setUnits(demoUnits);
  //   setFilteredUnits(demoUnits);
  //   setLoading(false);
  // }, 800);

  // Alternative implementation for fetching units:
  // async function fetchUnits() {
  //   try {
  //     const { data, error } = await supabase
  //       .from('units')
  //       .select(`
  //         *,
  //         properties(name),
  //         leases(
  //           tenant_id,
  //           tenant:users(full_name)
  //         )
  //       `);
  //
  //     if (error) throw error;
  //     
  //     setUnits(data);
  //     setFilteredUnits(data);
  //   } catch (error) {
  //     console.error('Error fetching units:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  */

  // Filter units based on search and status
  useEffect(() => {
    let results = units;
    
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(unit => 
        unit.unit_number.toLowerCase().includes(lowercaseQuery) ||
        unit.property?.name?.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    if (statusFilter) {
      results = results.filter(unit => unit.status === statusFilter);
    }
    
    setFilteredUnits(results);
  }, [searchQuery, statusFilter, units]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vacant':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Vacant</Badge>;
      case 'occupied':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Occupied</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Maintenance</Badge>;
      case 'renovation':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Renovation</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Handle unit form success
  const handleUnitSuccess = async () => {
    // Refresh units list
    try {
      setLoading(true);
      const { supabase } = await import('@/lib/supabase/client');
      
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          property:properties(id, name, address, property_type)
        `);
        
      if (error) throw error;
      
      if (data) {
        setUnits(data);
        setFilteredUnits(data);
      }
    } catch (error) {
      console.error('Error refreshing units:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit button click
  const handleEdit = (unitId: string) => {
    setEditUnitId(unitId);
    setModalOpen(true);
  };
  
  // Handle delete button click
  const handleDelete = async (unitId: string) => {
    if (confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      try {
        setLoading(true);
        const { supabase } = await import('@/lib/supabase/client');
        
        const { error } = await supabase
          .from('units')
          .delete()
          .eq('id', unitId);
          
        if (error) throw error;
        
        // Remove the deleted unit from state
        setUnits(prev => prev.filter(unit => unit.id !== unitId));
        setFilteredUnits(prev => prev.filter(unit => unit.id !== unitId));
        
        alert('Unit deleted successfully');
      } catch (error) {
        console.error('Error deleting unit:', error);
        alert('Failed to delete unit. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Units</h1>
            <p className="text-gray-500">Manage your rental units</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add New Unit
          </Button>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by unit number, property, or tenant..."
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
                      onClick={() => setStatusFilter("vacant")}
                      className="flex items-center justify-between"
                    >
                      Vacant
                      {statusFilter === "vacant" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("occupied")}
                      className="flex items-center justify-between"
                    >
                      Occupied
                      {statusFilter === "occupied" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("maintenance")}
                      className="flex items-center justify-between"
                    >
                      Maintenance
                      {statusFilter === "maintenance" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("renovation")}
                      className="flex items-center justify-between"
                    >
                      Renovation
                      {statusFilter === "renovation" && <Check className="h-4 w-4" />}
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
            ) : filteredUnits.length === 0 ? (
              <div className="p-8 text-center">
                <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No units found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">#</th>
                    <th className="text-left p-4 font-medium">Unit</th>
                    <th className="text-left p-4 font-medium">Property</th>
                    <th className="text-left p-4 font-medium">Details</th>
                    <th className="text-left p-4 font-medium">Rent</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map((unit, index) => (
                    <tr key={unit.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="p-4">
                        <div className="font-medium">{unit.unit_number}</div>
                        <div className="text-sm text-gray-500">
                          Floor {unit.floor_number || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">{unit.property?.name || 'N/A'}</td>
                      <td className="p-4">
                        <div className="text-sm">
                          <span className="font-medium">{unit.bedrooms || 0} bd, {unit.bathrooms || 0} ba</span>
                          <div className="text-gray-500">
                            {unit.square_feet ? `${unit.square_feet} sq ft` : 'Size N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{formatKSh(unit.rent_amount)}/month</td>
                      <td className="p-4">{getStatusBadge(unit.status)}</td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              Actions
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.location.href = `/units/${unit.id}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(unit.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              Edit Unit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUnitId(unit.id);
                                setAllocationDialogOpen(true);
                              }}
                              disabled={unit.status !== 'vacant'}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Allocate to Tenant
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(unit.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              Delete Unit
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
        
        {/* Unit Modal */}
        {modalOpen && (
          <UnitModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditUnitId(null);
            }}
            onSuccess={handleUnitSuccess}
            mode={editUnitId ? "edit" : "create"}
            unitId={editUnitId || undefined}
            properties={properties}
          />
        )}
      </div>

      {/* Unit Allocation Dialog */}
      {allocationDialogOpen && selectedUnitId && (
        <UnitAllocation
          isOpen={allocationDialogOpen}
          onClose={() => {
            setAllocationDialogOpen(false);
            setSelectedUnitId(null);
          }}
          unitId={selectedUnitId}
          onUnitAllocated={() => {
            // Refresh the units list after allocation
            const fetchData = async () => {
              try {
                setLoading(true);
                const { supabase } = await import('@/lib/supabase/client');
                
                // Fetch units with property details
                const { data: unitsData, error: unitsError } = await supabase
                  .from('units')
                  .select(`
                    *,
                    property:properties(id, name, address, property_type)
                  `);
                  
                if (unitsError) throw unitsError;
                
                if (unitsData) {
                  setUnits(unitsData);
                  setFilteredUnits(unitsData);
                }
              } catch (error) {
                console.error('Error fetching data:', error);
              } finally {
                setLoading(false);
              }
            };
            
            fetchData();
          }}
        />
      )}
    </MainLayout>
  );
}
