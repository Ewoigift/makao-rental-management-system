"use client";

import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UnitFormData {
  number: string;
  type: string;
  rent: number;
  status: "vacant" | "occupied";
}

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: UnitFormData) => void;
  mode: "create" | "edit";
  unitId?: Id<"units">;
}

const UNIT_TYPES = [
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "4 Bedroom",
  "Penthouse",
];

export default function UnitModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  unitId,
}: UnitModalProps) {
  const unit = useQuery(api.units.get, unitId ? { id: unitId } : "skip");
  const updateUnit = useMutation(api.units.update);

  const form = useForm<UnitFormData>({
    defaultValues: unit || {
      number: "",
      type: "",
      rent: 0,
      status: "vacant",
    },
  });

  const handleSubmit = async (data: UnitFormData) => {
    try {
      if (mode === "edit" && unitId) {
        await updateUnit({ id: unitId, ...data });
      } else {
        onSubmit?.(data);
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error submitting unit:', error);
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
              <label htmlFor="number" className="text-sm font-medium">
                Unit Number
              </label>
              <Input
                id="number"
                placeholder="Enter unit number"
                {...form.register("number", { required: true })}
              />
            </div>
            <div>
              <label htmlFor="type" className="text-sm font-medium">
                Type
              </label>
              <Select
                onValueChange={(value) => form.setValue("type", value)}
                defaultValue={form.getValues("type")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="rent" className="text-sm font-medium">
                Monthly Rent (KES)
              </label>
              <Input
                id="rent"
                type="number"
                placeholder="Enter monthly rent"
                {...form.register("rent", {
                  required: true,
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
            <div>
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                onValueChange={(value: "vacant" | "occupied") =>
                  form.setValue("status", value)
                }
                defaultValue={form.getValues("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Add Unit" : "Update Unit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
