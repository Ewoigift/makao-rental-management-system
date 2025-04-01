"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Home, Users, Trash2 } from "lucide-react";
import { propertiesService } from "@/services/properties";
import { unitsService } from "@/services/units";
import { formatCurrency } from "@/lib/utils";
import UnitModal from "@/components/properties/unit-modal";
import type { Property, Unit } from "@/types/supabase";

interface PropertyWithUnits extends Property {
  units: (Unit & {
    leases: Array<{
      tenants: Array<{
        first_name: string;
        last_name: string;
      }>;
    }>;
  })[];
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  
  const [property, setProperty] = useState<PropertyWithUnits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Fetch property details and units
  const fetchPropertyDetails = async () => {
    try {
      setIsLoading(true);
      const propertyData = await propertiesService.getProperty(propertyId);
      setProperty(propertyData);
    } catch (err) {
      setError('Failed to load property details');
      console.error('Error loading property:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const handleCreateUnit = async (unitData: any) => {
    try {
      await unitsService.createUnit({
        ...unitData,
        property_id: propertyId,
        status: 'vacant'
      });
      fetchPropertyDetails();
      setShowUnitModal(false);
    } catch (err) {
      console.error('Error creating unit:', err);
      // Handle error (show toast notification, etc.)
    }
  };

  const handleEditUnit = async (unitData: any) => {
    if (!selectedUnit) return;
    try {
      await unitsService.updateUnit(selectedUnit.id, unitData);
      fetchPropertyDetails();
      setShowUnitModal(false);
      setSelectedUnit(null);
    } catch (err) {
      console.error('Error updating unit:', err);
      // Handle error (show toast notification, etc.)
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    try {
      await unitsService.deleteUnit(unitId);
      fetchPropertyDetails();
    } catch (err) {
      console.error('Error deleting unit:', err);
      // Handle error (show toast notification, etc.)
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-10">Loading property details...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !property) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Property not found'}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <p className="text-gray-600 mt-1">{property.location}</p>
          </div>
          <Button onClick={() => setShowUnitModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Unit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{property.total_units}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {property.units.filter(u => u.status === 'occupied').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CardDescription>From occupied units</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  property.units
                    .filter(u => u.status === 'occupied')
                    .reduce((sum, unit) => sum + unit.rent_amount, 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Units</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Number</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Current Tenant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {property.units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unit_number}</TableCell>
                    <TableCell>{unit.floor_number || '-'}</TableCell>
                    <TableCell>{unit.bedrooms}BR {unit.bathrooms}BA</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        unit.status === 'occupied' ? 'bg-green-100 text-green-800' :
                        unit.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {unit.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(unit.rent_amount)}</TableCell>
                    <TableCell>
                      {unit.leases?.[0]?.tenants?.[0] ? 
                        `${unit.leases[0].tenants[0].first_name} ${unit.leases[0].tenants[0].last_name}` : 
                        '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUnit(unit);
                          setShowUnitModal(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUnit(unit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {showUnitModal && (
          <UnitModal
            isOpen={showUnitModal}
            onClose={() => {
              setShowUnitModal(false);
              setSelectedUnit(null);
            }}
            onSubmit={selectedUnit ? handleEditUnit : handleCreateUnit}
            unit={selectedUnit}
          />
        )}
      </div>
    </MainLayout>
  );
}
