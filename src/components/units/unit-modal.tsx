"use client";

import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { createUnit, updateUnit } from "@/lib/db/api-operations";
import { toast } from "sonner";

interface UnitFormData {
  unit_number: string;
  property_id: string;
  floor_number: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  rent_amount: number;
  deposit_amount: number;
  status: "vacant" | "occupied" | "maintenance" | "renovation";
  features?: any;
}

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode: "create" | "edit";
  unitId?: string;
  properties?: Array<{id: string, name: string}>;
}

const UNIT_STATUS = [
  "vacant",
  "occupied",
  "maintenance",
  "renovation"
];

export default function UnitModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  unitId,
  properties = []
}: UnitModalProps) {
  const [loading, setLoading] = useState(false);
  const [unitData, setUnitData] = useState<any>(null);
  
  const form = useForm<UnitFormData>({
    defaultValues: {
      unit_number: "",
      property_id: "",
      floor_number: null,
      bedrooms: null,
      bathrooms: null,
      square_feet: null,
      rent_amount: 0,
      deposit_amount: 0,
      status: "vacant",
      features: {}
    },
  });

  // Fetch unit data if in edit mode
  useEffect(() => {
    const fetchUnitData = async () => {
      if (mode === "edit" && unitId) {
        try {
          setLoading(true);
          const { supabase } = await import('@/lib/supabase/client');
          const { data, error } = await supabase
            .from('units')
            .select('*')
            .eq('id', unitId)
            .single();

          if (error) throw error;
          if (data) {
            setUnitData(data);
            form.reset(data);
          }
        } catch (error) {
          console.error('Error fetching unit:', error);
          toast.error('Failed to load unit data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUnitData();
  }, [mode, unitId, form]);

  const handleSubmit = async (data: UnitFormData) => {
    try {
      setLoading(true);
      
      if (mode === "edit" && unitId) {
        await updateUnit(unitId, data);
        toast.success('Unit updated successfully');
      } else {
        await createUnit(data);
        toast.success('Unit created successfully');
      }
      
      onClose();
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting unit:', error);
      toast.error('Error saving unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Unit" : "Edit Unit"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <label htmlFor="property_id" className="text-sm font-medium">
                Property
              </label>
              <Select
                onValueChange={(value) => form.setValue("property_id", value)}
                defaultValue={form.getValues("property_id")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="unit_number" className="text-sm font-medium">
                Unit Number
              </label>
              <Input
                id="unit_number"
                placeholder="Enter unit number"
                {...form.register("unit_number", { required: true })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bedrooms" className="text-sm font-medium">
                  Bedrooms
                </label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="Number of bedrooms"
                  {...form.register("bedrooms", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label htmlFor="bathrooms" className="text-sm font-medium">
                  Bathrooms
                </label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="Number of bathrooms"
                  {...form.register("bathrooms", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="floor_number" className="text-sm font-medium">
                  Floor Number
                </label>
                <Input
                  id="floor_number"
                  type="number"
                  placeholder="Floor number"
                  {...form.register("floor_number", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label htmlFor="square_feet" className="text-sm font-medium">
                  Square Feet
                </label>
                <Input
                  id="square_feet"
                  type="number"
                  placeholder="Square feet"
                  {...form.register("square_feet", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="rent_amount" className="text-sm font-medium">
                  Monthly Rent (KES)
                </label>
                <Input
                  id="rent_amount"
                  type="number"
                  placeholder="Enter monthly rent"
                  {...form.register("rent_amount", {
                    required: true,
                    valueAsNumber: true,
                    min: 0,
                  })}
                />
              </div>
              <div>
                <label htmlFor="deposit_amount" className="text-sm font-medium">
                  Deposit Amount (KES)
                </label>
                <Input
                  id="deposit_amount"
                  type="number"
                  placeholder="Enter deposit amount"
                  {...form.register("deposit_amount", {
                    required: true,
                    valueAsNumber: true,
                    min: 0,
                  })}
                />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                onValueChange={(value) =>
                  form.setValue("status", value as any)
                }
                defaultValue={form.getValues("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : mode === "create" ? "Add Unit" : "Update Unit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
