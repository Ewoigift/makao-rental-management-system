"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Check, Loader2, PenToolIcon, Upload, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { createMaintenanceRequest, getTenantUnit } from '@/lib/db/maintenance-utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/main-layout';

export default function NewMaintenanceRequestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [images, setImages] = useState<Array<{ file: File; preview: string; name: string }>>([]);
  const [tenantUnit, setTenantUnit] = useState<any>(null);
  const [loadingUnit, setLoadingUnit] = useState(true);
  const { user } = useUser();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    preferredDate: '',
    preferredTime: '',
    allowEntry: false,
    contactPhone: ''
  });
  
  // Fetch tenant's unit
  useEffect(() => {
    async function fetchTenantUnit() {
      try {
        if (!user?.id) return;
        
        const unit = await getTenantUnit(user.id);
        setTenantUnit(unit);
      } catch (error) {
        console.error('Error fetching tenant unit:', error);
      } finally {
        setLoadingUnit(false);
      }
    }
    
    if (user) {
      fetchTenantUnit();
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked) => {
    setFormData({
      ...formData,
      allowEntry: checked
    });
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files) as File[];
    
    // Create preview URLs for the images
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setImages([...images, ...newImages]);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !tenantUnit) {
      toast.error('Unable to submit request. Please try again later.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create the maintenance request
      const result = await createMaintenanceRequest(user.id, {
        unit_id: tenantUnit.id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority
      });
      
      if (result) {
        setIsSubmitted(true);
        toast.success('Maintenance request submitted successfully!');
      } else {
        throw new Error('Failed to create maintenance request');
      }
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      toast.error('Failed to submit maintenance request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render form
  const renderForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Issue Title</Label>
          <Input 
            id="title" 
            name="title"
            placeholder="Brief title of the issue" 
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2 mb-4">
            <Label htmlFor="description">Issue Description</Label>
            <Textarea 
              id="description"
              placeholder="Please describe the issue in detail"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              required
            />
          </div>
        </div>
        
        <div>
          <Label>Priority</Label>
          <RadioGroup 
            value={formData.priority} 
            onValueChange={(value) => setFormData({...formData, priority: value})}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low">Low</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high">High</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="emergency" id="emergency" />
              <Label htmlFor="emergency">Emergency</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preferredDate">Preferred Date (Optional)</Label>
            <Input 
              id="preferredDate" 
              name="preferredDate"
              type="date" 
              value={formData.preferredDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="preferredTime">Preferred Time (Optional)</Label>
            <Select 
              name="preferredTime"
              value={formData.preferredTime} 
              onValueChange={(value) => setFormData({...formData, preferredTime: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preferred time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="allowEntry" 
              checked={formData.allowEntry}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="allowEntry">
              Allow maintenance staff to enter if I am not present
            </Label>
          </div>
          
          <div>
            <Label htmlFor="contactPhone">Contact Phone Number</Label>
            <Input 
              id="contactPhone" 
              name="contactPhone"
              placeholder="Phone number for maintenance coordination" 
              value={formData.contactPhone}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="images">Upload Images (Optional)</Label>
          <div className="mt-2">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="images"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB each)</p>
                </div>
                <Input 
                  id="images" 
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
          
          {/* Image previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <div className="relative h-24 w-full rounded-md overflow-hidden">
                    <Image 
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center text-xs"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                  <p className="text-xs text-gray-500 truncate mt-1">{image.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" asChild>
          <Link href="/tenant/maintenance">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Request
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );

  // Render success message
  const renderSuccess = () => (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Request Submitted</h2>
          <p className="text-muted-foreground mb-6">Your maintenance request has been submitted successfully. We'll get back to you soon.</p>
          <div className="space-y-2">
            <Button className="w-full" asChild>
              <Link href="/tenant/maintenance">View All Requests</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/tenant/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/tenant/maintenance" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold">New Maintenance Request</h1>
        </div>
        
        {loadingUnit ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !tenantUnit ? (
          <Card>
            <CardContent className="py-10 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Unit Assigned</h2>
              <p className="text-muted-foreground mb-6">You don't have any units assigned to your account. Please contact your property manager.</p>
              <Link href="/tenant/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              {isSubmitted ? renderSuccess() : renderForm()}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
