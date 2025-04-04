"use client";

import { MainLayout } from "@/components/layout/main-layout";
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
import { Badge } from "@/components/ui/badge";

// Types
interface Unit {
  id: string;
  number: string;
  propertyName: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  rent: string;
  status: 'vacant' | 'occupied' | 'maintenance';
  tenantName?: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // In a real app, fetch units from Supabase
  useEffect(() => {
    // Sample data - would come from Supabase in production
    const demoUnits: Unit[] = [
      {
        id: "u1",
        number: "A101",
        propertyName: "Sunset Apartments",
        type: "Apartment",
        bedrooms: 2,
        bathrooms: 1,
        size: "80 sqm",
        rent: "KES 25,000",
        status: "occupied",
        tenantName: "John Doe"
      },
      {
        id: "u2",
        number: "A102",
        propertyName: "Sunset Apartments",
        type: "Apartment",
        bedrooms: 2,
        bathrooms: 1,
        size: "80 sqm",
        rent: "KES 25,000",
        status: "vacant"
      },
      {
        id: "u3",
        number: "B201",
        propertyName: "Sunset Apartments",
        type: "Apartment",
        bedrooms: 3,
        bathrooms: 2,
        size: "110 sqm",
        rent: "KES 35,000",
        status: "occupied",
        tenantName: "Jane Smith"
      },
      {
        id: "u4",
        number: "B202",
        propertyName: "Sunset Apartments",
        type: "Apartment",
        bedrooms: 3,
        bathrooms: 2,
        size: "110 sqm",
        rent: "KES 35,000",
        status: "maintenance"
      },
      {
        id: "u5",
        number: "C101",
        propertyName: "Riverside Homes",
        type: "Townhouse",
        bedrooms: 4,
        bathrooms: 3,
        size: "150 sqm",
        rent: "KES 60,000",
        status: "occupied",
        tenantName: "Robert Johnson"
      },
      {
        id: "u6",
        number: "C102",
        propertyName: "Riverside Homes",
        type: "Townhouse",
        bedrooms: 4,
        bathrooms: 3,
        size: "150 sqm",
        rent: "KES 60,000",
        status: "vacant"
      },
    ];

    // Simulate API loading delay
    setTimeout(() => {
      setUnits(demoUnits);
      setFilteredUnits(demoUnits);
      setLoading(false);
    }, 800);

    // In production:
    // async function fetchUnits() {
    //   try {
    //     const supabase = createSupabaseClient();
    //     const { data, error } = await supabase
    //       .from('units')
    //       .select(`
    //         *,
    //         properties(name),
    //         leases(
    //           tenant_id,
    //           tenants(full_name)
    //         )
    //       `)
    //       .eq('is_active', true);
    //
    //     if (error) throw error;
    //     
    //     const formattedUnits = data.map(unit => ({
    //       id: unit.id,
    //       number: unit.unit_number,
    //       propertyName: unit.properties.name,
    //       type: unit.unit_type,
    //       bedrooms: unit.bedrooms,
    //       bathrooms: unit.bathrooms,
    //       size: `${unit.size_sqm} sqm`,
    //       rent: `KES ${unit.rent_amount.toLocaleString()}`,
    //       status: unit.status,
    //       tenantName: unit.leases?.[0]?.tenants?.full_name
    //     }));
    //
    //     setUnits(formattedUnits);
    //     setFilteredUnits(formattedUnits);
    //   } catch (error) {
    //     console.error('Error fetching units:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    //
    // fetchUnits();
  }, []);

  // Filter units based on search and status
  useEffect(() => {
    let results = units;
    
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(unit => 
        unit.number.toLowerCase().includes(lowercaseQuery) ||
        unit.propertyName.toLowerCase().includes(lowercaseQuery) ||
        unit.tenantName?.toLowerCase().includes(lowercaseQuery)
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
      default:
        return <Badge>{status}</Badge>;
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
          <Button className="flex items-center gap-2">
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
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Unit</th>
                    <th className="text-left p-4 font-medium">Property</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Size</th>
                    <th className="text-left p-4 font-medium">Rent</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Tenant</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{unit.number}</div>
                        <div className="text-sm text-gray-500">
                          {unit.bedrooms} bd, {unit.bathrooms} ba
                        </div>
                      </td>
                      <td className="p-4">{unit.propertyName}</td>
                      <td className="p-4">{unit.type}</td>
                      <td className="p-4">{unit.size}</td>
                      <td className="p-4">{unit.rent}</td>
                      <td className="p-4">{getStatusBadge(unit.status)}</td>
                      <td className="p-4">
                        {unit.tenantName ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {unit.tenantName}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
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
