"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvoiceDownloadButton, InvoiceData, InvoiceViewer } from "./invoice-pdf";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: string;
  payment_method: string;
  invoice_number: string;
  tenant: {
    id: string;
    full_name: string;
    email: string;
  };
  unit: {
    id: string;
    unit_number: string;
    property: {
      id: string;
      name: string;
      landlord: {
        id: string;
        full_name: string;
        email: string;
      };
    };
  };
}

interface PaymentDetailsModalProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsModal({ payment, open, onOpenChange }: PaymentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details");

  // Convert payment to invoice data format
  const getInvoiceData = (): InvoiceData | null => {
    if (!payment) return null;

    return {
      id: payment.id,
      invoiceNumber: payment.invoice_number || `INV-${payment.id.slice(0, 6).toUpperCase()}`,
      issuedDate: new Date(payment.due_date).toISOString().split('T')[0],
      dueDate: new Date(payment.due_date).toISOString().split('T')[0],
      paidDate: payment.status === 'paid' ? new Date(payment.payment_date).toISOString().split('T')[0] : undefined,
      status: payment.status as 'paid' | 'pending' | 'overdue',
      amount: payment.amount,
      tenantName: payment.tenant?.full_name || 'Tenant',
      tenantEmail: payment.tenant?.email,
      propertyName: payment.unit?.property?.name || 'Property',
      unitNumber: payment.unit?.unit_number || 'Unit',
      landlordName: payment.unit?.property?.landlord?.full_name || 'Landlord',
      landlordEmail: payment.unit?.property?.landlord?.email,
      description: `Rent payment for ${payment.unit?.unit_number} at ${payment.unit?.property?.name}`,
      paymentMethod: payment.payment_method
    };
  };

  const invoiceData = getInvoiceData();
  
  if (!payment) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Details</span>
            <Badge className={
              payment.status === 'paid' ? 'bg-green-100 text-green-800' :
              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {payment.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Invoice #{payment.invoice_number || `INV-${payment.id.slice(0, 6).toUpperCase()}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Payment Details</TabsTrigger>
            <TabsTrigger value="invoice">Invoice Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
                    <p className="text-lg font-semibold">KES {payment.amount.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <Badge className={
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {payment.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                    <p>{new Date(payment.due_date).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Date</h3>
                    <p>
                      {payment.status === 'paid' 
                        ? new Date(payment.payment_date).toLocaleDateString() 
                        : 'Not paid yet'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tenant</h3>
                    <p>{payment.tenant?.full_name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Property</h3>
                    <p>{payment.unit?.property?.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Unit</h3>
                    <p>{payment.unit?.unit_number}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
                    <p>{payment.payment_method || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-2">
                  {invoiceData && (
                    <>
                      <InvoiceDownloadButton invoiceData={invoiceData} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoice" className="h-[calc(100vh-300px)]">
            {invoiceData && (
              <div className="h-full">
                <InvoiceViewer invoiceData={invoiceData} />
              </div>
            )}
            <div className="flex justify-end mt-4 space-x-2">
              {invoiceData && (
                <InvoiceDownloadButton invoiceData={invoiceData} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
