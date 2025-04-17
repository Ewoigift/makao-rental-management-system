"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Search, Filter, Check, Mail, Phone, Home, Calendar, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  SubleaseAgreementData, 
  SubleaseAgreementModal
} from "@/components/lease/sublease-agreement";

// Types based on Supabase schema
interface Lease {
  id: string;
  tenant_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  created_at: string;
  updated_at: string;
  tenant?: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
  };
  unit?: {
    id: string;
    unit_number: string;
    property_id: string;
    property?: {
      id: string;
      name: string;
      address: string;
      city: string;
    };
  };
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

  // Fetch leases from Supabase
  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLoading(true);
        const { getAllLeases } = await import('@/lib/db/api-operations');
        const data = await getAllLeases();
        
        if (data) {
          setLeases(data);
          setFilteredLeases(data);
        }
      } catch (error) {
        console.error('Error fetching leases:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeases();
  }, []);

  // Filter leases based on search and status
  useEffect(() => {
    let results = leases;
    
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(lease => 
        (lease.tenant?.full_name?.toLowerCase() || '').includes(lowercaseQuery) ||
        (lease.tenant?.email?.toLowerCase() || '').includes(lowercaseQuery) ||
        (lease.unit?.unit_number?.toLowerCase() || '').includes(lowercaseQuery) ||
        (lease.unit?.property?.name?.toLowerCase() || '').includes(lowercaseQuery)
      );
    }
    
    if (statusFilter) {
      results = results.filter(lease => lease.status === statusFilter);
    }
    
    setFilteredLeases(results);
  }, [searchQuery, statusFilter, leases]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Expired</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Terminated</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Generate lease agreement data from lease
  const generateLeaseAgreementData = (lease: Lease): SubleaseAgreementData => {
    return {
      originalTenantName: lease.tenant?.full_name || 'Tenant',
      originalTenantEmail: lease.tenant?.email,
      originalTenantPhone: lease.tenant?.phone_number,
      subtenant: {
        name: lease.tenant?.full_name || 'Tenant',
        email: lease.tenant?.email,
        phone: lease.tenant?.phone_number,
      },
      property: {
        name: lease.unit?.property?.name || 'Property',
        address: lease.unit?.property?.address || 'Address',
        unitNumber: lease.unit?.unit_number || 'Unit',
      },
      subleaseTerms: {
        startDate: lease.start_date,
        endDate: lease.end_date,
        monthlyRent: lease.rent_amount,
        securityDeposit: lease.deposit_amount,
      },
      landlordApproval: true,
      landlordName: "Property Management",
      signingDate: lease.created_at || new Date().toISOString(),
    };
  };

  // View lease details
  const handleViewLease = (lease: Lease) => {
    setSelectedLease(lease);
    setIsLeaseModalOpen(true);
  };

  // Close lease modal
  const handleCloseLeaseModal = () => {
    setIsLeaseModalOpen(false);
  };
  
  // Open agreement preview
  const handleViewAgreement = () => {
    setIsAgreementModalOpen(true);
  };
  
  // Close agreement modal
  const handleCloseAgreementModal = () => {
    setIsAgreementModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Leases</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lease
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lease Management</CardTitle>
            <div className="flex items-center justify-between mt-2">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search leases..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                      <Check className={`mr-2 h-4 w-4 ${!statusFilter ? "opacity-100" : "opacity-0"}`} />
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      <Check className={`mr-2 h-4 w-4 ${statusFilter === "active" ? "opacity-100" : "opacity-0"}`} />
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                      <Check className={`mr-2 h-4 w-4 ${statusFilter === "pending" ? "opacity-100" : "opacity-0"}`} />
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("expired")}>
                      <Check className={`mr-2 h-4 w-4 ${statusFilter === "expired" ? "opacity-100" : "opacity-0"}`} />
                      Expired
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("terminated")}>
                      <Check className={`mr-2 h-4 w-4 ${statusFilter === "terminated" ? "opacity-100" : "opacity-0"}`} />
                      Terminated
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">Loading leases...</p>
                </div>
              </div>
            ) : filteredLeases.length === 0 ? (
              <div className="text-center p-8">
                <Users className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-xl font-semibold">No leases found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter
                    ? "Try changing your search or filter"
                    : "Add your first lease to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Tenant</th>
                    <th className="text-left p-4 font-medium">Unit</th>
                    <th className="text-left p-4 font-medium">Lease Period</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Rent</th>
                    <th className="text-left p-4 font-medium">Deposit</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredLeases.map((lease) => (
                    <tr key={lease.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{lease.tenant?.full_name || 'N/A'}</div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3.5 w-3.5 text-gray-500" />
                            {lease.tenant?.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1 text-sm mt-1">
                            <Phone className="h-3.5 w-3.5 text-gray-500" />
                            {lease.tenant?.phone_number || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4 text-gray-500" />
                          {lease.unit?.unit_number || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lease.unit?.property?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {formatDate(lease.start_date)} to<br />{formatDate(lease.end_date)}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(lease.status)}</td>
                      <td className="p-4">{formatCurrency(lease.rent_amount)}</td>
                      <td className="p-4">{formatCurrency(lease.deposit_amount)}</td>
                      <td className="p-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewLease(lease)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lease Details Modal */}
      {selectedLease && (
        <Dialog open={isLeaseModalOpen} onOpenChange={setIsLeaseModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Lease Details</DialogTitle>
              <DialogDescription>
                Lease information for {selectedLease.tenant?.full_name} at {selectedLease.unit?.property?.name}, Unit {selectedLease.unit?.unit_number}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="font-medium mb-2">Tenant Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedLease.tenant?.full_name}</p>
                  <p><span className="font-medium">Email:</span> {selectedLease.tenant?.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedLease.tenant?.phone_number}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Property Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Property:</span> {selectedLease.unit?.property?.name}</p>
                  <p><span className="font-medium">Unit:</span> {selectedLease.unit?.unit_number}</p>
                  <p><span className="font-medium">Address:</span> {selectedLease.unit?.property?.address}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Lease Terms</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Start Date:</span> {formatDate(selectedLease.start_date)}</p>
                  <p><span className="font-medium">End Date:</span> {formatDate(selectedLease.end_date)}</p>
                  <p><span className="font-medium">Status:</span> <span className="capitalize">{selectedLease.status}</span></p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Financial Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Monthly Rent:</span> {formatCurrency(selectedLease.rent_amount)}</p>
                  <p><span className="font-medium">Security Deposit:</span> {formatCurrency(selectedLease.deposit_amount)}</p>
                  <p><span className="font-medium">Created:</span> {formatDate(selectedLease.created_at)}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewAgreement}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Agreement
              </Button>
              <Button
                onClick={() => setIsLeaseModalOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Lease Agreement Preview Modal */}
      {selectedLease && (
        <SubleaseAgreementModal
          isOpen={isAgreementModalOpen}
          onClose={handleCloseAgreementModal}
          agreementData={generateLeaseAgreementData(selectedLease)}
        />
      )}
    </MainLayout>
  );
}
