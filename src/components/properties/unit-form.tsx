import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UnitFormData {
  number: string;
  type: string;
  rent: number;
  size?: string;
  description?: string;
}

interface UnitFormProps {
  onSubmit: (data: UnitFormData) => void;
  onCancel: () => void;
  initialData?: UnitFormData;
}

export default function UnitForm({ initialData, onSubmit, onCancel }: UnitFormProps) {
  const [formData, setFormData] = useState<UnitFormData>(
    initialData || {
      number: "",
      type: "",
      rent: 0,
      size: "",
      description: "",
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
          placeholder="e.g., 1 Bedroom, Studio"
          required
          className="mt-1"
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
        <label htmlFor="size" className="block text-sm font-medium text-gray-700">
          Size (sq ft)
        </label>
        <Input
          id="size"
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1"
        />
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
