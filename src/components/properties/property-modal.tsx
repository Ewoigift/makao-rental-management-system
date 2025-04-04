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
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  county: z.string().min(2, { message: "County must be at least 2 characters." }),
  description: z.string().optional(),
  property_type: z.enum(["apartment", "house", "commercial", "mixed_use"]),
  total_units: z.coerce
    .number()
    .min(1, { message: "Total units must be at least 1" })
    .int({ message: "Total units must be a whole number" }),
  owner_id: z.string().optional(),
  manager_id: z.string().optional(),
  amenities: z.any().optional(),
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
      address: "",
      city: "",
      county: "",
      description: "",
      property_type: "apartment",
      total_units: 1,
      amenities: {},
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
        address: "",
        city: "",
        county: "",
        description: "",
        property_type: "apartment",
        total_units: 1,
        amenities: {},
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
                          <SelectItem value="mixed_use">Mixed Use</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Address*
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
              
              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> City*
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter city" 
                        {...field} 
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* County */}
              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> County*
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter county" 
                        {...field} 
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* This space intentionally left empty to balance grid */}
              <div></div>

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

              {/* Additional field can be added here in the future */}
              <div></div>
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
