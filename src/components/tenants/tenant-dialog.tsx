"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseClient } from "@/lib/auth/auth-utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatKSh } from "@/lib/utils/currency";

interface TenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  mode?: 'view' | 'edit';
  onTenantUpdated?: () => void;
}

interface Tenant {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  clerk_id?: string;
  profile_picture_url?: string;
  user_type?: string;
  role?: string;
  created_at: string;
  leases?: any[];
}

interface Unit {
  id: string;
  unit_number: string;
  property_id: string;
  property?: {
    id: string;
    name: string;
  };
  status: string;
  rent_amount: number;
}

export default function TenantDialog({
  isOpen,
  onClose,
  tenantId,
  mode = 'view',
  onTenantUpdated,
}: TenantDialogProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [units, setUnits] = useState<Unit[]>([]);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [properties, setProperties] = useState<{id: string, name: string}[]>([]);
  const [rentAmount, setRentAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [paymentDay, setPaymentDay] = useState("1");
  const [allocatingUnit, setAllocatingUnit] = useState(false);
  const [isRemoveUnitDialogOpen, setIsRemoveUnitDialogOpen] = useState(false);
  const [selectedLeaseToRemove, setSelectedLeaseToRemove] = useState<any>(null);
  
  // Fetch tenant data
  useEffect(() => {
    const fetchTenant = async () => {
      if (!tenantId) return;
      
      try {
        setLoading(true);
        const supabase = createSupabaseClient();
        
        // Get tenant with their lease information
        const { data, error } = await supabase
          .from("users")
          .select(`
            *,
            leases(
              *,
              unit:units(
                *,
                property:properties(id, name)
              )
            )
          `)
          .eq("id", tenantId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          console.log("Tenant data:", data);
          setTenant(data);
          setFormData({
            full_name: data.full_name || '',
            email: data.email || '',
            phone_number: data.phone_number || '',
            notes: data.notes || ''
          });
        }
      } catch (error) {
        console.error("Error fetching tenant:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchProperties = async () => {
      try {
        const supabase = createSupabaseClient();
        
        // Get all properties for filtering
        const { data, error } = await supabase
          .from("properties")
          .select('id, name')
          .eq("is_active", true);
          
        if (error) throw error;
        
        if (data) {
          console.log("Properties:", data);
          setProperties(data);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    
    const fetchAvailableUnits = async () => {
      try {
        const supabase = createSupabaseClient();
        
        // Get all vacant units with their properties
        const { data, error } = await supabase
          .from("units")
          .select(`
            *,
            property:properties(id, name)
          `)
          .eq("status", "vacant");
          
        if (error) throw error;
        
        if (data) {
          console.log("Available units:", data);
          setAvailableUnits(data);
        }
      } catch (error) {
        console.error("Error fetching available units:", error);
      }
    };
    
    if (isOpen) {
      fetchTenant();
      fetchProperties();
      fetchAvailableUnits();
    }
  }, [isOpen, tenantId]);
  
  // When a property is selected, filter available units
  useEffect(() => {
    if (selectedProperty) {
      // Filter units by selected property
      const filteredUnits = availableUnits.filter(unit => 
        unit.property_id === selectedProperty
      );
      
      // Reset selected unit if it's not in the filtered list
      if (selectedUnitId && !filteredUnits.some(u => u.id === selectedUnitId)) {
        setSelectedUnitId("");
        setRentAmount("");
        setDepositAmount("");
      }
    }
  }, [selectedProperty, availableUnits, selectedUnitId]);
  
  // When a unit is selected, pre-fill rent and deposit amounts
  useEffect(() => {
    if (selectedUnitId) {
      const unit = availableUnits.find(u => u.id === selectedUnitId);
      if (unit) {
        setRentAmount(unit.rent_amount.toString());
        setDepositAmount(unit.rent_amount.toString());
      }
    }
  }, [selectedUnitId, availableUnits]);
  
  // Set default lease dates (current month to 1 year later)
  useEffect(() => {
    const now = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);
    
    setLeaseStart(now.toISOString().split("T")[0]);
    setLeaseEnd(nextYear.toISOString().split("T")[0]);
  }, []);
  
  const handleAllocateUnit = async () => {
    if (!tenant || !selectedUnitId || !rentAmount || !depositAmount || !leaseStart || !leaseEnd) return;
    
    try {
      setAllocatingUnit(true);
      const supabase = createSupabaseClient();
      
      // First check if this unit already has an active lease
      const { data: existingLeases, error: leaseCheckError } = await supabase
        .from("leases")
        .select("*")
        .eq("unit_id", selectedUnitId)
        .eq("status", "active");
        
      if (leaseCheckError) throw leaseCheckError;
      
      if (existingLeases && existingLeases.length > 0) {
        alert("This unit already has an active lease. Please select another unit.");
        setAllocatingUnit(false);
        return;
      }
      
      // 1. Create a new lease
      const { data: leaseData, error: leaseError } = await supabase
        .from("leases")
        .insert({
          tenant_id: tenant.id,
          unit_id: selectedUnitId,
          start_date: leaseStart,
          end_date: leaseEnd,
          rent_amount: parseFloat(rentAmount),
          deposit_amount: parseFloat(depositAmount),
          payment_day: parseInt(paymentDay),
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (leaseError) throw leaseError;
      
      // 2. Update unit status to occupied
      const { error: unitError } = await supabase
        .from("units")
        .update({ status: "occupied" })
        .eq("id", selectedUnitId);
        
      if (unitError) throw unitError;
      
      // Refresh tenant data
      const { data: updatedTenant, error: tenantError } = await supabase
        .from("users")
        .select(`
          *,
          leases(
            *,
            unit:units(
              *,
              property:properties(id, name)
            )
          )
        `)
        .eq("id", tenant.id)
        .single();
        
      if (tenantError) throw tenantError;
      
      if (updatedTenant) {
        setTenant(updatedTenant);
      }
      
      // Reset form
      setSelectedUnitId("");
      setRentAmount("");
      setDepositAmount("");
      
      // Switch to details tab
      setActiveTab("details");
      
      // Refresh available units
      const { data: updatedUnits, error: unitsError } = await supabase
        .from("units")
        .select(`*, property:properties(id, name)`)
        .eq("status", "vacant");
        
      if (unitsError) throw unitsError;
      
      if (updatedUnits) {
        setAvailableUnits(updatedUnits);
      }
    } catch (error) {
      console.error("Error allocating unit:", error);
      alert("Failed to allocate unit. Please try again.");
    } finally {
      setAllocatingUnit(false);
    }
  };
  
  // Get formatted date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Render lease status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Download lease as PDF
  const handleDownloadLease = (lease: any) => {
    // In a real implementation, this would generate a PDF
    // For now, we'll just create a text representation and download it
    const leaseText = `
      LEASE AGREEMENT
      ===============
      
      PROPERTY: ${lease.unit?.property?.name}
      UNIT: ${lease.unit?.unit_number}
      
      TENANT: ${tenant?.full_name}
      EMAIL: ${tenant?.email}
      PHONE: ${tenant?.phone_number || 'N/A'}
      
      LEASE TERM: ${formatDate(lease.start_date)} to ${formatDate(lease.end_date)}
      RENT AMOUNT: ${formatKSh(lease.rent_amount)}
      DEPOSIT AMOUNT: ${formatKSh(lease.deposit_amount)}
      PAYMENT DUE: ${lease.payment_day || 1}th day of each month
      
      SIGNATURES:
      
      Tenant: ________________________     Date: ____________
      
      Landlord: ______________________     Date: ____________
    `;
    
    // Create a Blob with the text content
    const blob = new Blob([leaseText], { type: 'text/plain' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lease_${tenant?.full_name.replace(/\s+/g, '_')}_${lease.unit?.unit_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Save tenant details
  const handleSaveTenant = async () => {
    if (!tenant) return;
    
    try {
      setIsSaving(true);
      const supabase = createSupabaseClient();
      
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", tenant.id);
        
      if (error) throw error;
      
      // Refresh tenant data
      const { data: updatedTenant, error: fetchError } = await supabase
        .from("users")
        .select(`
          *,
          leases(
            *,
            unit:units(
              *,
              property:properties(id, name)
            )
          )
        `)
        .eq("id", tenant.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (updatedTenant) {
        setTenant(updatedTenant);
      }
      
      setIsEditing(false);
      if (onTenantUpdated) onTenantUpdated();
      
    } catch (error) {
      console.error("Error updating tenant:", error);
      alert("Failed to update tenant information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFromUnit = async () => {
    if (!selectedLeaseToRemove) return;
    
    try {
      setIsSaving(true);
      
      // Make API call to update lease status to 'terminated'
      const response = await fetch(`/api/leases/${selectedLeaseToRemove.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'terminated',
          end_date: new Date().toISOString().split('T')[0] // End lease today
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to terminate lease');
      }
      
      // Make API call to update unit status to vacant
      const unitResponse = await fetch(`/api/units/${selectedLeaseToRemove.unit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'vacant',
          tenant_id: null
        })
      });
      
      if (!unitResponse.ok) {
        throw new Error('Failed to update unit status');
      }
      
      // Update the local tenant state to reflect changes
      if (tenant) {
        const updatedLeases = tenant.leases?.map(lease => {
          if (lease.id === selectedLeaseToRemove.id) {
            return { ...lease, status: 'terminated' };
          }
          return lease;
        });
        
        setTenant({
          ...tenant,
          leases: updatedLeases
        });
        
        // Refresh available units
        const fetchAvailableUnits = async () => {
          try {
            const supabase = createSupabaseClient();
            
            // Get all vacant units with their properties
            const { data, error } = await supabase
              .from("units")
              .select(`
                *,
                property:properties(id, name)
              `)
              .eq("status", "vacant");
              
            if (error) throw error;
            
            if (data) {
              console.log("Available units:", data);
              setAvailableUnits(data);
            }
          } catch (error) {
            console.error("Error fetching available units:", error);
          }
        };
        fetchAvailableUnits();
      }
      
      // Close the dialog
      setIsRemoveUnitDialogOpen(false);
      setSelectedLeaseToRemove(null);
      
      alert("Tenant has been removed from unit successfully");
      
      // Notify parent component that tenant was updated
      if (onTenantUpdated) {
        onTenantUpdated();
      }
    } catch (error) {
      console.error('Error removing tenant from unit:', error);
      alert("Failed to remove tenant from unit");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tenant ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {tenant.profile_picture_url ? (
                    <img
                      src={tenant.profile_picture_url}
                      alt={tenant.full_name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      {tenant.full_name?.charAt(0) || "T"}
                    </div>
                  )}
                  {tenant.full_name}
                  
                  {!isEditing && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="ml-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5 4 4"/></svg>
                      Edit
                    </Button>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Tenant ID: {tenant.id}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="details">Tenant Details</TabsTrigger>
                  <TabsTrigger value="leases">Current Leases</TabsTrigger>
                  <TabsTrigger value="allocate">Allocate Unit</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <div className="h-10 px-3 py-2 border rounded-md bg-gray-50">
                          {tenant.role || tenant.user_type || "Tenant"}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone_number">Phone</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label>Joined</Label>
                        <div className="h-10 px-3 py-2 border rounded-md bg-gray-50">
                          {formatDate(tenant.created_at)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <div className="font-medium">{tenant.full_name}</div>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <div className="font-medium">{tenant.role || tenant.user_type || "Tenant"}</div>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <div className="font-medium">{tenant.email}</div>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <div className="font-medium">{tenant.phone_number || "N/A"}</div>
                      </div>
                      <div>
                        <Label>Joined</Label>
                        <div className="font-medium">{formatDate(tenant.created_at)}</div>
                      </div>
                      {tenant.notes && (
                        <div className="col-span-2">
                          <Label>Notes</Label>
                          <div className="font-medium">{tenant.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="leases" className="space-y-4">
                  {tenant.leases && tenant.leases.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{tenant.leases.length} Active Lease(s)</h3>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab("allocate")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          Allocate a Unit
                        </Button>
                      </div>
                      {tenant.leases.map(lease => (
                        <div key={lease.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">
                                {lease.unit?.unit_number} - {lease.unit?.property?.name}
                              </h3>
                              <p className="text-gray-500">
                                {formatDate(lease.start_date)} to {formatDate(lease.end_date)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {getStatusBadge(lease.status)}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 px-2 text-xs"
                                onClick={() => handleDownloadLease(lease)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                PDF
                              </Button>
                              {lease.status === 'active' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedLeaseToRemove(lease);
                                    setIsRemoveUnitDialogOpen(true);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4">
                            <div>
                              <Label className="text-xs text-gray-500">Rent Amount</Label>
                              <div>{formatKSh(lease.rent_amount)}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Deposit</Label>
                              <div>{formatKSh(lease.deposit_amount)}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Payment Day</Label>
                              <div>{lease.payment_day || 1} of each month</div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Status</Label>
                              <div>{getStatusBadge(lease.status)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path><polyline points="15,9 18,9 18,11"></polyline><path d="M6 8v9"></path><path d="M10 8v9"></path><path d="M14 8v9"></path></svg>
                        <div className="text-gray-400 mb-2">No active leases found</div>
                        <p className="text-gray-500 text-sm max-w-md mb-4">This tenant has not been assigned to any units yet. You can allocate a unit to start a new lease.</p>
                        <Button
                          variant="default" 
                          onClick={() => setActiveTab("allocate")}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          Allocate a Unit
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="allocate" className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50 mb-4">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-3 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Allocate Another Unit</h3>
                        <p className="text-xs text-blue-600 mt-1">
                          You can allocate multiple units to this tenant. Each unit allocation will create a new lease agreement.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="property">Select Property</Label>
                      <Select 
                        value={selectedProperty} 
                        onValueChange={setSelectedProperty}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Properties</SelectItem>
                          {properties.map(property => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="unit">Select Unit</Label>
                      <Select 
                        value={selectedUnitId} 
                        onValueChange={setSelectedUnitId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vacant unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUnits
                            .filter(unit => !selectedProperty || selectedProperty === "all" || unit.property_id === selectedProperty)
                            .length > 0 ? (
                              availableUnits
                                .filter(unit => !selectedProperty || selectedProperty === "all" || unit.property_id === selectedProperty)
                                .map(unit => (
                                  <SelectItem key={unit.id} value={unit.id}>
                                    {unit.unit_number} - {unit.property?.name} ({formatKSh(unit.rent_amount)})
                                  </SelectItem>
                                ))
                            ) : (
                              <SelectItem value="none" disabled>No vacant units available</SelectItem>
                            )
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rent">Monthly Rent</Label>
                        <Input
                          id="rent"
                          type="number"
                          value={rentAmount}
                          onChange={(e) => setRentAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deposit">Security Deposit</Label>
                        <Input
                          id="deposit"
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Lease Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={leaseStart}
                          onChange={(e) => setLeaseStart(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date">Lease End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={leaseEnd}
                          onChange={(e) => setLeaseEnd(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="payment-day">Payment Day (of Month)</Label>
                      <Select 
                        value={paymentDay} 
                        onValueChange={setPaymentDay}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                {activeTab === "allocate" ? (
                  <Button 
                    onClick={handleAllocateUnit} 
                    disabled={!selectedUnitId || !rentAmount || !depositAmount || !leaseStart || !leaseEnd || allocatingUnit}
                  >
                    {allocatingUnit ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Allocating...
                      </>
                    ) : (
                      "Allocate Unit"
                    )}
                  </Button>
                ) : isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTenant} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={onClose}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">Tenant not found</div>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRemoveUnitDialogOpen} onOpenChange={setIsRemoveUnitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Tenant from Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {tenant?.full_name} from unit {selectedLeaseToRemove?.unit?.unit_number} at {selectedLeaseToRemove?.unit?.property?.name} and make it vacant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-lg bg-red-50 mb-4">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-3 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Important</h3>
                <p className="text-xs text-red-600 mt-1">
                  This will terminate the current lease agreement and make the unit available for new tenants. Any pending payments will not be affected.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRemoveUnitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveFromUnit}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  Remove & Make Vacant
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
