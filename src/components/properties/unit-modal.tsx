"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Unit } from "@/types/supabase";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UnitFormData) => void;
  unit?: Unit | null;
}

interface UnitFormData {
  unit_number: string;
  floor_number?: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  rent_amount: number;
  amenities: string[];
  status: 'vacant' | 'occupied' | 'maintenance';
}

const DEFAULT_AMENITIES = [
  'Air Conditioning',
  'Balcony',
  'Built-in Wardrobe',
  'Dishwasher',
  'Furnished',
  'Parking',
  'Water Heater',
  'WiFi',
];

export default function UnitModal({
  isOpen,
  onClose,
  onSubmit,
  unit,
}: UnitModalProps) {
  const [formData, setFormData] = useState<UnitFormData>({
    unit_number: "",
    floor_number: "",
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 0,
    rent_amount: 0,
    amenities: [],
    status: "vacant",
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        unit_number: unit.unit_number,
        floor_number: unit.floor_number || "",
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        square_feet: unit.square_feet,
        rent_amount: unit.rent_amount,
        amenities: unit.amenities || [],
        status: unit.status as 'vacant' | 'occupied' | 'maintenance',
      });
    }
  }, [unit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {unit ? 'Edit Unit' : 'Add New Unit'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_number">Unit Number*</Label>
              <Input
                id="unit_number"
                value={formData.unit_number}
                onChange={(e) =>
                  setFormData({ ...formData, unit_number: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor_number">Floor Number</Label>
              <Input
                id="floor_number"
                value={formData.floor_number}
                onChange={(e) =>
                  setFormData({ ...formData, floor_number: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms*</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms*</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="square_feet">Square Feet*</Label>
              <Input
                id="square_feet"
                type="number"
                min="0"
                value={formData.square_feet}
                onChange={(e) =>
                  setFormData({ ...formData, square_feet: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent_amount">Monthly Rent (KES)*</Label>
              <Input
                id="rent_amount"
                type="number"
                min="0"
                value={formData.rent_amount}
                onChange={(e) =>
                  setFormData({ ...formData, rent_amount: parseInt(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status*</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'vacant' | 'occupied' | 'maintenance') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_AMENITIES.map((amenity) => (
                <Button
                  key={amenity}
                  type="button"
                  variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => toggleAmenity(amenity)}
                >
                  <span className="mr-2">
                    {formData.amenities.includes(amenity) ? "✓" : ""}
                  </span>
                  {amenity}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {unit ? 'Update Unit' : 'Create Unit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
