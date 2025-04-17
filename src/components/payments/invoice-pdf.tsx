"use client";

import { Document, Page, Text, View, StyleSheet, Font, PDFViewer } from '@react-pdf/renderer';
import { Button } from '../ui/button';
import { FileDown, Eye } from 'lucide-react';
import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';

// Define type for payment data
export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  amount: number;
  tenantName: string;
  tenantEmail?: string;
  propertyName: string;
  unitNumber: string;
  landlordName: string;
  landlordEmail?: string;
  description: string;
  paymentMethod?: string;
}

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    padding: 30,
    flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  header: {
    borderBottom: '1 solid #eaeaea',
    paddingBottom: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0f172a',
  },
  label: {
    fontSize: 10,
    color: '#64748b', 
    marginBottom: 3,
  },
  value: {
    fontSize: 11,
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoColumn: {
    flexDirection: 'column',
    width: '48%',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0f172a',
  },
  divider: {
    borderBottom: '1 solid #eaeaea',
    marginVertical: 15,
  },
  summaryContainer: {
    marginTop: 20,
    borderTop: '1 solid #eaeaea',
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 11,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1 solid #eaeaea',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#64748b',
  },
  status: {
    padding: '5 10',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusPending: {
    backgroundColor: '#fef9c3',
    color: '#854d0e',
  },
  statusOverdue: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
});

// Format currency
const formatCurrency = (amount: number) => {
  return `KES ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

// Format date string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Define InvoicePDF component
const InvoicePDF = ({ invoiceData }: { invoiceData: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>INVOICE</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[
            styles.status,
            invoiceData.status === 'paid' ? styles.statusPaid : 
            invoiceData.status === 'pending' ? styles.statusPending : styles.statusOverdue
          ]}>
            {invoiceData.status.toUpperCase()}
          </Text>
          <Text style={styles.label}>INVOICE NUMBER</Text>
          <Text style={styles.value}>{invoiceData.invoiceNumber}</Text>
          <Text style={styles.label}>ISSUE DATE</Text>
          <Text style={styles.value}>{formatDate(invoiceData.issuedDate)}</Text>
          <Text style={styles.label}>DUE DATE</Text>
          <Text style={styles.value}>{formatDate(invoiceData.dueDate)}</Text>
          {invoiceData.paidDate && (
            <>
              <Text style={styles.label}>PAYMENT DATE</Text>
              <Text style={styles.value}>{formatDate(invoiceData.paidDate)}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoColumn}>
          <Text style={styles.sectionTitle}>BILLED TO:</Text>
          <Text style={styles.value}>{invoiceData.tenantName}</Text>
          {invoiceData.tenantEmail && <Text style={styles.value}>{invoiceData.tenantEmail}</Text>}
          <Text style={styles.value}>{invoiceData.unitNumber}, {invoiceData.propertyName}</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.sectionTitle}>FROM:</Text>
          <Text style={styles.value}>{invoiceData.landlordName}</Text>
          {invoiceData.landlordEmail && <Text style={styles.value}>{invoiceData.landlordEmail}</Text>}
          <Text style={styles.value}>MAKAO RENTAL MANAGEMENT</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View>
        <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>DESCRIPTION</Text>
          <Text style={styles.summaryLabel}>AMOUNT</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>{invoiceData.description}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(invoiceData.amount)}</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoiceData.amount)}</Text>
        </View>
      </View>

      {invoiceData.paymentMethod && (
        <View style={{marginTop: 30}}>
          <Text style={styles.sectionTitle}>PAYMENT INFORMATION</Text>
          <Text style={styles.value}>METHOD: {invoiceData.paymentMethod.toUpperCase()}</Text>
        </View>
      )}

      <Text style={styles.footer}>
        THIS IS A COMPUTER-GENERATED DOCUMENT AND REQUIRES NO SIGNATURE. FOR ANY QUERIES REGARDING THIS INVOICE, PLEASE CONTACT SUPPORT@MAKAO.COM
      </Text>
    </Page>
  </Document>
);

// PDF Download Button Component
export function InvoiceDownloadButton({ invoiceData }: { invoiceData: InvoiceData }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<InvoicePDF invoiceData={invoiceData} />).toBlob();
      
      // Create a download link and trigger it
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [invoiceData]);

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={generatePdf}
      disabled={isGenerating}
    >
      <FileDown className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating PDF...' : 'Download Invoice'}
    </Button>
  );
}

// PDF Viewer Component (for preview)
export function InvoiceViewer({ invoiceData }: { invoiceData: InvoiceData }) {
  return (
    <PDFViewer style={{ width: '100%', height: '70vh' }}>
      <InvoicePDF invoiceData={invoiceData} />
    </PDFViewer>
  );
}

// Preview Button that returns a component to view the PDF
export function InvoicePreviewButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onClick}
      className="ml-2"
    >
      <Eye className="h-4 w-4 mr-2" />
      Preview Invoice
    </Button>
  );
}

// Export InvoicePDF for use in other components
export { InvoicePDF };
