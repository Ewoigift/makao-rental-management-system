"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash } from "lucide-react";
import UnitModal from "@/components/units/unit-modal";
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

interface UnitFormData {
  number: string;
  type: string;
  rent: number;
  status: "vacant" | "occupied";
}

export default function UnitsPage() {
  const params = useParams();
  const propertyId = params.propertyId as Id<"properties">;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{ id: Id<"units">; number: string } | null>(null);
  const [editUnit, setEditUnit] = useState<Id<"units"> | null>(null);

  // Fetch units using Convex
  const units = useQuery(api.units.listByProperty, { propertyId }) || [];
  const property = useQuery(api.properties.get, { id: propertyId });

  // Mutations
  const createUnit = useMutation(api.units.create);
  const deleteUnit = useMutation(api.units.remove);

  const handleAddUnit = async (data: UnitFormData) => {
    try {
      await createUnit({
        propertyId,
        ...data,
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error creating unit:', error);
    }
  };

  const handleDeleteUnit = async () => {
    if (!selectedUnit) return;
    try {
      await deleteUnit({ id: selectedUnit.id });
      setSelectedUnit(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Units</h1>
            <p className="text-gray-500">
              Manage units for {property?.name}
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rent (KES)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit._id}>
                  <TableCell>{unit.number}</TableCell>
                  <TableCell>{unit.type}</TableCell>
                  <TableCell>{unit.rent.toLocaleString()}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        unit.status === "occupied"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {unit.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditUnit(unit._id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedUnit({ id: unit._id, number: unit.number });
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {units.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No units found. Add a new unit to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <UnitModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddUnit}
          mode="create"
        />

        {editUnit && (
          <UnitModal
            isOpen={true}
            onClose={() => setEditUnit(null)}
            mode="edit"
            unitId={editUnit}
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Unit</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete unit {selectedUnit?.number}? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedUnit(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUnit}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
