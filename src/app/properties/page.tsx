"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Plus, 
  Building2, 
  Home, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import PropertyModal from "@/components/properties/property-modal";
import { propertiesService } from "@/services/properties";
import { supabase } from "@/lib/supabase/client";
import type { Property, Unit } from "@/types/supabase";
import { formatCurrency, calculatePropertyRevenue } from "@/lib/utils";
import ProtectedLayout from "@/components/layout/protected-layout";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PropertyWithUnits extends Property {
  units?: Unit[];
  occupancy_rate?: number;
  total_revenue?: number;
  vacant_units?: number;
  occupied_units?: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithUnits[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit" | "view",
    property: null as PropertyWithUnits | null,
  });
  const [deleteDialogState, setDeleteDialogState] = useState({
    isOpen: false,
    propertyId: null as string | null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter properties based on search term
  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.property_type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch properties with units and calculations
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      // Use existing Supabase client
      
      // Fetch properties with units
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*, units(*)')
        .order('created_at', { ascending: false });
      
      if (propertiesError) throw propertiesError;
      
      // Calculate additional stats for each property
      const enhancedProperties = propertiesData.map((property: Property & { units?: Unit[] }) => {
        const units = property.units || [];
        const totalUnits = property.total_units || 0;
        const occupiedUnits = units.filter((unit: Unit) => unit.status === 'occupied').length;
        const vacantUnits = totalUnits - occupiedUnits;
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
        const totalRevenue = units.reduce((sum: number, unit: Unit) => sum + (unit.rent_amount || 0), 0);
        
        return {
          ...property,
          units,
          occupancy_rate: occupancyRate,
          total_revenue: totalRevenue,
          vacant_units: vacantUnits,
          occupied_units: occupiedUnits,
        };
      });
      
      setProperties(enhancedProperties);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      toast.error('Error loading properties');
      console.error('Error loading properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle property form submission (create or update)
  const handlePropertySubmit = async (propertyData: any) => {
    try {
      // Use existing supabase client
      const isEditing = !!propertyData.id;
      
      if (isEditing) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update({
            name: propertyData.name,
            location: propertyData.location,
            description: propertyData.description,
            property_type: propertyData.property_type,
            status: propertyData.status,
            total_units: propertyData.total_units,
            year_built: propertyData.year_built || null,
            purchase_price: propertyData.purchase_price || null,
            monthly_expenses: propertyData.monthly_expenses || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', propertyData.id);
          
        if (error) throw error;
        toast.success('Property updated successfully');
      } else {
        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert({
            name: propertyData.name,
            location: propertyData.location,
            description: propertyData.description,
            property_type: propertyData.property_type,
            status: propertyData.status,
            total_units: propertyData.total_units,
            year_built: propertyData.year_built || null,
            purchase_price: propertyData.purchase_price || null,
            monthly_expenses: propertyData.monthly_expenses || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
        if (error) throw error;
        toast.success('Property created successfully');
      }
      
      // Close modal and refresh data
      setModalState({ isOpen: false, mode: "add", property: null });
      await fetchProperties();
    } catch (err) {
      console.error('Property operation error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save property');
    }
  };
  
  // Handle property deletion
  const handleDeleteProperty = async () => {
    if (!deleteDialogState.propertyId) return;
    
    try {
      setIsLoading(true);
      // Use existing supabase client
      
      // First check if there are any units with tenants
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .eq('property_id', deleteDialogState.propertyId)
        .eq('status', 'occupied');
        
      if (unitsError) throw unitsError;
      
      if (units && units.length > 0) {
        throw new Error('Cannot delete property with occupied units. Please relocate tenants first.');
      }
      
      // Delete all property units first
      const { error: deleteUnitsError } = await supabase
        .from('units')
        .delete()
        .eq('property_id', deleteDialogState.propertyId);
        
      if (deleteUnitsError) throw deleteUnitsError;
      
      // Then delete the property
      const { error: deletePropertyError } = await supabase
        .from('properties')
        .delete()
        .eq('id', deleteDialogState.propertyId);
        
      if (deletePropertyError) throw deletePropertyError;
      
      toast.success('Property deleted successfully');
      setDeleteDialogState({ isOpen: false, propertyId: null });
      await fetchProperties();
    } catch (err) {
      console.error('Property deletion error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete property');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open modal helpers
  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      property: null,
    });
  };
  
  const openViewModal = (property: PropertyWithUnits) => {
    setModalState({
      isOpen: true,
      mode: "view",
      property,
    });
  };
  
  const openEditModal = (property: PropertyWithUnits) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      property,
    });
  };
  
  const openDeleteDialog = (propertyId: string) => {
    setDeleteDialogState({
      isOpen: true,
      propertyId,
    });
  };

  return (
    <ProtectedLayout>
      <div className="container py-6">
        {/* Header with search and add button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Properties Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your properties, view details, and track performance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search properties..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            <Button
              onClick={openAddModal}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-destructive/15 p-4 mb-4 text-destructive">
            <p>{error}</p>
          </div>
        )}

        {/* Property summary cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
              <p className="text-xs text-muted-foreground mt-1">across your entire portfolio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Home className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties.reduce((sum, p) => sum + (p.total_units || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {properties.reduce((sum, p) => sum + (p.vacant_units || 0), 0)} vacant units available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(properties.reduce((sum, p) => sum + (p.total_revenue || 0), 0))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">from all occupied units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Occupancy Rate</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties.length ? Math.round(properties.reduce((sum, p) => sum + (p.occupancy_rate || 0), 0) / properties.length) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">across all properties</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading properties...</span>
          </div>
        ) : (
          <>
            {/* Properties table */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Properties List</CardTitle>
              </CardHeader>
              <CardContent>
                {paginatedProperties.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-2">No properties found</p>
                    <Button variant="outline" onClick={openAddModal}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Property
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-center">Units</TableHead>
                          <TableHead className="text-center">Occupancy</TableHead>
                          <TableHead className="text-center">Revenue</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProperties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{property.location}</TableCell>
                            <TableCell>
                              {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                            </TableCell>
                            <TableCell className="text-center">
                              {property.occupied_units}/{property.total_units}
                            </TableCell>
                            <TableCell className="text-center">
                              <span 
                                className={`px-2 py-1 rounded-full text-xs ${property.occupancy_rate >= 80 ? 'bg-green-100 text-green-800' : 
                                property.occupancy_rate >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}
                              >
                                {property.occupancy_rate}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {formatCurrency(property.total_revenue || 0)}
                            </TableCell>
                            <TableCell className="text-center">
                              <span 
                                className={`px-2 py-1 rounded-full text-xs ${property.status === 'active' ? 'bg-green-100 text-green-800' : 
                                property.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}`}
                              >
                                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openViewModal(property)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditModal(property)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Property
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => openDeleteDialog(property.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Property
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              {/* Pagination */}
              {totalPages > 1 && (
                <CardFooter>
                  <Pagination className="w-full justify-center">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardFooter>
              )}
            </Card>
          </>
        )}

        {/* Property Modal */}
        <PropertyModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onSubmit={handlePropertySubmit}
          propertyData={modalState.property}
          mode={modalState.mode}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialogState.isOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDeleteDialogState({ isOpen: false, propertyId: null });
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this property?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the property
                and all its associated data from your portfolio.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProperty}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Property
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedLayout>
  );
}
