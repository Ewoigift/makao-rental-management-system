import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Check, Loader2, Tool, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewMaintenanceRequestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [images, setImages] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'normal',
    preferredDate: '',
    preferredTime: '',
    allowEntry: false,
    contactPhone: ''
  });

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

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
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
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  // Render form
  const renderForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            name="category"
            value={formData.category} 
            onValueChange={(value) => setFormData({...formData, category: value})}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select issue category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="appliance">Appliance</SelectItem>
              <SelectItem value="hvac">HVAC / Air Conditioning</SelectItem>
              <SelectItem value="structural">Structural</SelectItem>
              <SelectItem value="pest">Pest Control</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
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
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            name="description"
            placeholder="Please describe the issue in detail" 
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            required
          />
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
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal">Normal</Label>
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
                  onChange={handleImageUpload}
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
    <div className="text-center space-y-6">
      <div className="bg-green-100 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
        <Check className="h-12 w-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold">Request Submitted</h2>
        <p className="text-gray-500 mt-2">
          Your maintenance request has been submitted successfully.
        </p>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-md text-left">
        <h3 className="font-medium mb-4">Request Details</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium capitalize">{formData.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <p className="font-medium capitalize">{formData.priority}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Issue</p>
            <p className="font-medium">{formData.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-sm">{formData.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Request ID</p>
            <p className="font-medium">MR-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              Submitted
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/tenant/maintenance">View All Requests</Link>
        </Button>
        <Button asChild>
          <Link href="/tenant/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Submit Maintenance Request</h1>
          <p className="text-gray-500">Report an issue with your unit</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {isSubmitted ? renderSuccess() : renderForm()}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
