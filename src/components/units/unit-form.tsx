"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UnitFormData {
  number: string;
  type: string;
  rent: number;
  status: 'vacant' | 'occupied';
}

interface UnitFormProps {
  initialData?: UnitFormData;
  onSubmit: (data: UnitFormData) => void;
  onCancel: () => void;
}

export default function UnitForm({ initialData, onSubmit, onCancel }: UnitFormProps) {
  const [formData, setFormData] = useState<UnitFormData>(
    initialData || {
      number: "",
      type: "",
      rent: 0,
      status: "vacant"
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="number" className="block text-sm font-medium text-gray-700">
          Unit Number
        </label>
        <Input
          id="number"
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Unit Type
        </label>
        <Input
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          required
          className="mt-1"
          placeholder="e.g., 1 Bedroom, 2 Bedroom, Studio"
        />
      </div>

      <div>
        <label htmlFor="rent" className="block text-sm font-medium text-gray-700">
          Monthly Rent (KES)
        </label>
        <Input
          id="rent"
          type="number"
          min="0"
          value={formData.rent}
          onChange={(e) => setFormData({ ...formData, rent: parseInt(e.target.value) })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'vacant' | 'occupied' })}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
        >
          <option value="vacant">Vacant</option>
          <option value="occupied">Occupied</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Unit</Button>
      </div>
    </form>
  );
}
