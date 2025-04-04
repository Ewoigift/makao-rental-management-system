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
import { Loader2 } from "lucide-react";
import { formatKSh } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

interface UnitAllocationProps {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  onUnitAllocated?: () => void;
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
  deposit_amount: number;
}

interface Tenant {
  id: string;
  full_name: string;
  email: string;
  clerk_id?: string;
}

export default function UnitAllocation({
  isOpen,
  onClose,
  unitId,
  onUnitAllocated,
}: UnitAllocationProps) {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [leaseStartDate, setLeaseStartDate] = useState<Date | undefined>(new Date());
  const [leaseEndDate, setLeaseEndDate] = useState<Date | undefined>(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
  const [paymentDay, setPaymentDay] = useState("1");
  const [allocating, setAllocating] = useState(false);
  
  // Fetch unit data and available tenants
  useEffect(() => {
    const fetchData = async () => {
      if (!unitId) return;
      
      try {
        setLoading(true);
        const supabase = createSupabaseClient();
        
        // Get unit with property information
        const { data: unitData, error: unitError } = await supabase
          .from("units")
          .select(`
            *,
            property:properties(id, name)
          `)
          .eq("id", unitId)
          .single();
          
        if (unitError) throw unitError;
        
        if (unitData) {
          console.log("Unit data:", unitData);
          setUnit(unitData);
          setRentAmount(unitData.rent_amount.toString());
          setDepositAmount(unitData.deposit_amount.toString());
        }
        
        // Get all tenants without active leases
        const { data: tenantsData, error: tenantsError } = await supabase
          .from("users")
          .select(`
            id,
            full_name,
            email,
            clerk_id
          `)
          .or('role.eq.tenant,user_type.eq.tenant');
          
        if (tenantsError) throw tenantsError;
        
        if (tenantsData) {
          console.log("Available tenants:", tenantsData);
          setTenants(tenantsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchData();
      
      // Set default lease dates (current month to 1 year later)
      const now = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(now.getFullYear() + 1);
      
      setLeaseStartDate(now);
      setLeaseEndDate(nextYear);
    }
  }, [isOpen, unitId]);
  
  const handleAllocateUnit = async () => {
    if (!unit || !selectedTenantId || !rentAmount || !depositAmount || !leaseStartDate || !leaseEndDate) return;
    
    try {
      setAllocating(true);
      const supabase = createSupabaseClient();
      
      // 1. Create a new lease
      const { data: leaseData, error: leaseError } = await supabase
        .from("leases")
        .insert({
          tenant_id: selectedTenantId,
          unit_id: unit.id,
          start_date: leaseStartDate.toISOString(),
          end_date: leaseEndDate.toISOString(),
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
        .eq("id", unit.id);
        
      if (unitError) throw unitError;
      
      // Success - close dialog and notify parent
      if (onUnitAllocated) onUnitAllocated();
      onClose();
      
    } catch (error) {
      console.error("Error allocating unit:", error);
      alert("Failed to allocate unit. Please try again.");
    } finally {
      setAllocating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : unit ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Allocate Unit {unit.unit_number}
              </DialogTitle>
              <DialogDescription>
                {unit.property?.name} - {unit.status === "vacant" ? (
                  <Badge className="bg-green-100 text-green-800">Vacant</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Not Available</Badge>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {unit.status !== "vacant" ? (
              <div className="py-6 text-center">
                <p className="text-red-600 mb-4">This unit is not available for allocation.</p>
                <Button onClick={onClose}>Close</Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="font-medium">Rent Amount:</div>
                    <div>{formatKSh(unit.rent_amount)}/month</div>
                  </div>
                  
                  <div>
                    <Label htmlFor="tenant">Select Tenant</Label>
                    <Select 
                      value={selectedTenantId} 
                      onValueChange={setSelectedTenantId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.length > 0 ? (
                          tenants.map(tenant => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.full_name} ({tenant.email})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No tenants available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rent">Monthly Rent (KSh)</Label>
                      <Input
                        id="rent"
                        type="number"
                        value={rentAmount}
                        onChange={(e) => setRentAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deposit">Security Deposit (KSh)</Label>
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
                    <DatePicker
                      label="Lease Start Date"
                      date={leaseStartDate}
                      setDate={setLeaseStartDate}
                    />
                    <DatePicker
                      label="Lease End Date"
                      date={leaseEndDate}
                      setDate={setLeaseEndDate}
                    />
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
                
                <DialogFooter>
                  <Button variant="outline" onClick={onClose} disabled={allocating}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAllocateUnit} 
                    disabled={!selectedTenantId || !rentAmount || !depositAmount || !leaseStartDate || !leaseEndDate || allocating}
                  >
                    {allocating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Allocating...
                      </>
                    ) : (
                      "Allocate Unit"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">Unit not found</div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
