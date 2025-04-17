"use client";

import { useState, useCallback, useEffect } from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf 
} from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

// Define the sublease agreement data interface
export interface SubleaseAgreementData {
  originalTenantName: string;
  originalTenantEmail?: string;
  originalTenantPhone?: string;
  subtenant: {
    name: string;
    email?: string;
    phone?: string;
    idNumber?: string;
  };
  property: {
    name: string;
    address: string;
    unitNumber: string;
  };
  subleaseTerms: {
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    utilityPayments?: string;
    otherTerms?: string;
  };
  landlordApproval: boolean;
  landlordName?: string;
  signingDate: string;
}

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 30,
    lineHeight: 1.5
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  section: {
    marginBottom: 15
  },
  heading: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5
  },
  paragraph: {
    marginBottom: 10
  },
  signature: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureBox: {
    width: '40%'
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    marginTop: 40,
    marginBottom: 5
  },
  date: {
    fontSize: 10
  }
});

// Format date string
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format currency
const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString()}`;
};

// Create sublease agreement PDF component
const SubleaseAgreementPDF = ({ data }: { data: SubleaseAgreementData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>SUBLEASE AGREEMENT</Text>
      
      <View style={styles.section}>
        <Text style={styles.heading}>1. PARTIES</Text>
        <Text style={styles.paragraph}>
          This Sublease Agreement is made on {formatDate(data.signingDate)} between {data.originalTenantName} 
          ("Original Tenant") and {data.subtenant.name} ("Subtenant") 
          with the consent of {data.landlordName || "the Property Owner"} ("Landlord").
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.heading}>2. PREMISES</Text>
        <Text style={styles.paragraph}>
          The Original Tenant agrees to sublease to the Subtenant Unit {data.property.unitNumber} 
          at {data.property.name}, {data.property.address} ("Premises").
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.heading}>3. TERM</Text>
        <Text style={styles.paragraph}>
          The sublease term shall begin on {formatDate(data.subleaseTerms.startDate)} and 
          end on {formatDate(data.subleaseTerms.endDate)}.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.heading}>4. RENT</Text>
        <Text style={styles.paragraph}>
          Subtenant shall pay monthly rent of {formatCurrency(data.subleaseTerms.monthlyRent)} 
          to the Original Tenant, due on the 1st day of each month.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.heading}>5. SECURITY DEPOSIT</Text>
        <Text style={styles.paragraph}>
          Subtenant shall pay a security deposit of {formatCurrency(data.subleaseTerms.securityDeposit)} 
          to the Original Tenant upon signing this agreement.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.heading}>6. UTILITIES AND SERVICES</Text>
        <Text style={styles.paragraph}>
          {data.subleaseTerms.utilityPayments || 
            "Subtenant shall be responsible for payment of all utilities and services for the Premises during the sublease term."}
        </Text>
      </View>
      
      {data.subleaseTerms.otherTerms && (
        <View style={styles.section}>
          <Text style={styles.heading}>7. ADDITIONAL TERMS</Text>
          <Text style={styles.paragraph}>{data.subleaseTerms.otherTerms}</Text>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.heading}>8. LANDLORD APPROVAL</Text>
        <Text style={styles.paragraph}>
          {data.landlordApproval 
            ? "The Landlord has approved this sublease." 
            : "This sublease is contingent upon approval from the Landlord."}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.heading}>9. ORIGINAL LEASE</Text>
        <Text style={styles.paragraph}>
          The Subtenant acknowledges receipt of a copy of the original lease agreement between 
          the Original Tenant and Landlord. The Subtenant agrees to comply with all terms, 
          conditions, rules, and regulations of the original lease.
        </Text>
      </View>
      
      <View style={styles.signature}>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text>Original Tenant Signature</Text>
          <Text style={styles.date}>{formatDate(data.signingDate)}</Text>
        </View>
        
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text>Subtenant Signature</Text>
          <Text style={styles.date}>{formatDate(data.signingDate)}</Text>
        </View>
      </View>
      
      {data.landlordApproval && (
        <View style={[styles.signature, { marginTop: 40 }]}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text>Landlord Signature</Text>
            <Text style={styles.date}>{formatDate(data.signingDate)}</Text>
          </View>
        </View>
      )}
    </Page>
  </Document>
);

// Sublease Agreement Download Button Component
export function SubleaseAgreementDownloadButton({ agreementData }: { agreementData: SubleaseAgreementData }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<SubleaseAgreementPDF data={agreementData} />).toBlob();
      
      // Create a download link and trigger it
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `sublease-agreement-${agreementData.property.unitNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [agreementData]);

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={generatePdf}
      disabled={isGenerating}
    >
      <FileDown className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating PDF...' : 'Download Sublease Agreement'}
    </Button>
  );
}

// Sublease Agreement Preview Modal
export function SubleaseAgreementModal({
  isOpen,
  onClose,
  agreementData
}: {
  isOpen: boolean;
  onClose: () => void;
  agreementData: SubleaseAgreementData;
}) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Reset loading state when modal opens
    if (isOpen) {
      setIsLoading(true);
      // Allow a small delay for rendering
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sublease Agreement</DialogTitle>
          <DialogDescription>
            Preview the sublease agreement for unit {agreementData.property.unitNumber} at {agreementData.property.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 h-full overflow-hidden">
          {isLoading ? (
            <div className="h-[calc(100vh-250px)] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <iframe
              className="w-full h-[calc(100vh-250px)] border rounded"
              src={`data:application/pdf;base64,${btoa(
                pdf(<SubleaseAgreementPDF data={agreementData} />).toString()
              )}`}
              title="Sublease Agreement Preview"
            />
          )}
        </div>
        
        <DialogFooter>
          <SubleaseAgreementDownloadButton agreementData={agreementData} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
