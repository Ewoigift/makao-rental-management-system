"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Building2, Home, TrendingUp } from "lucide-react";
import Link from "next/link";
import PropertyModal from "@/components/properties/property-modal";
import { propertiesService } from "@/services/properties";
import type { Property } from "@/types/supabase";
import { formatCurrency, calculatePropertyRevenue } from "@/lib/utils";
import ProtectedLayout from "@/components/layout/protected-layout";

interface PropertyWithUnits extends Property {
  units?: Array<{ status: string; rent_amount: number }>;
  occupancy_rate?: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithUnits[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesService.getAllProperties();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      console.error('Error loading properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle property creation
  const handleCreateProperty = async (propertyData: any) => {
    try {
      console.log('Attempting to create property with data:', propertyData);
      
      // Validate required fields
      if (!propertyData.name) throw new Error('Property name is required');
      if (!propertyData.location) throw new Error('Location is required');
      if (!propertyData.property_type) throw new Error('Property type is required');
      if (!propertyData.total_units || propertyData.total_units < 1) {
        throw new Error('Total units must be at least 1');
      }

      await propertiesService.createProperty(propertyData);
      setShowAddProperty(false);
      await fetchProperties();
    } catch (err) {
      console.error('Property creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create property');
    }
  };

  return (
    <ProtectedLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Properties</h1>
          <Button
            onClick={() => setShowAddProperty(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        <PropertyModal
          isOpen={showAddProperty}
          onClose={() => setShowAddProperty(false)}
          onSubmit={handleCreateProperty}
        />

        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties.reduce((sum, p) => sum + (p.total_units || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(calculatePropertyRevenue(properties))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties.reduce((sum, p) => sum + (p.occupancy_rate || 0), 0) / properties.length || 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">
                    {property.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {property.location}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-xs">
                    {property.total_units} units
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm">{property.property_type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm">{property.status}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/properties/${property.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Details
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
