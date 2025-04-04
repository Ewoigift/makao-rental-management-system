"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, MapPin, Home, FileText, Percent } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define zod schema for property form validation
const propertyFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Property name must be at least 3 characters." }),
  location: z.string().min(5, { message: "Location must be at least 5 characters." }),
  description: z.string().optional(),
  property_type: z.enum(["apartment", "house", "commercial", "mixed"]),
  status: z.enum(["active", "inactive", "maintenance"]).default("active"),
  total_units: z.coerce
    .number()
    .min(1, { message: "Total units must be at least 1" })
    .int({ message: "Total units must be a whole number" }),
  year_built: z.coerce
    .number()
    .min(1900, { message: "Year built must be after 1900" })
    .max(new Date().getFullYear(), { message: "Year built cannot be in the future" })
    .optional(),
  purchase_price: z.coerce
    .number()
    .min(0, { message: "Purchase price must be a positive number" })
    .optional(),
  monthly_expenses: z.coerce
    .number()
    .min(0, { message: "Monthly expenses must be a positive number" })
    .optional(),
});

// Create a TypeScript type from the zod schema
type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyFormValues) => void;
  propertyData?: PropertyFormValues | null;
  mode: "add" | "edit" | "view";
}

export default function PropertyModal({
  isOpen,
  onClose,
  onSubmit,
  propertyData = null,
  mode = "add",
}: PropertyModalProps) {
  // Initialize react-hook-form with zod validation
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
      property_type: "apartment",
      status: "active",
      total_units: 1,
      year_built: undefined,
      purchase_price: undefined,
      monthly_expenses: undefined,
    },
  });

  // Load property data when editing
  useEffect(() => {
    if (propertyData && (mode === "edit" || mode === "view")) {
      // Reset form with property data
      form.reset(propertyData);
    } else if (!propertyData && mode === "add") {
      // Reset form to defaults when adding new
      form.reset({
        name: "",
        location: "",
        description: "",
        property_type: "apartment",
        status: "active",
        total_units: 1,
        year_built: undefined, 
        purchase_price: undefined,
        monthly_expenses: undefined,
      });
    }
  }, [propertyData, mode, form]);

  // Handle form submission
  const handleFormSubmit = (data: PropertyFormValues) => {
    try {
      onSubmit(data);
      toast.success(mode === "add" ? "Property added successfully" : "Property updated successfully");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save property");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {mode === "add" && "Add New Property"}
            {mode === "edit" && "Edit Property"}
            {mode === "view" && "Property Details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" && "Fill the form below to add a new property to your portfolio."}
            {mode === "edit" && "Make changes to your property details and save when done."}
            {mode === "view" && "View detailed information about this property."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Property Name*
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter property name" 
                        {...field} 
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Type */}
              <FormField
                control={form.control}
                name="property_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Home className="h-4 w-4" /> Property Type*
                    </FormLabel>
                    <FormControl>
                      <Select 
                        disabled={mode === "view"}
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment Building</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="mixed">Mixed Use</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Location*
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter full address" 
                        {...field} 
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select 
                        disabled={mode === "view"}
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="maintenance">Under Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total Units */}
              <FormField
                control={form.control}
                name="total_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Home className="h-4 w-4" /> Total Units*
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field} 
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Year Built */}
              <FormField
                control={form.control}
                name="year_built"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Built</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 2005"
                        {...field} 
                        value={field.value || ""}
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter property description" 
                      className="min-h-[100px]"
                      {...field} 
                      disabled={mode === "view"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Purchase Price */}
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        placeholder="e.g. $250,000"
                        {...field} 
                        value={field.value || ""}
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Monthly Expenses */}
              <FormField
                control={form.control}
                name="monthly_expenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Expenses ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        placeholder="e.g. $1,500"
                        {...field} 
                        value={field.value || ""}
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {mode === "view" ? "Close" : "Cancel"}
              </Button>
              {mode !== "view" && (
                <Button type="submit">
                  {mode === "add" ? "Create Property" : "Save Changes"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
