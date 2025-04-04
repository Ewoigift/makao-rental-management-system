"use client";

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Check, CreditCard, Receipt, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createPayment, getTenantLease, getTenantPaymentSummary } from '@/lib/db/payments-utils';
import { formatDate } from '@/lib/utils/index';

// Step-based payment flow
const STEPS = {
  PAYMENT_DETAILS: 0,
  PAYMENT_METHOD: 1,
  CONFIRMATION: 2,
  COMPLETE: 3
};

export default function MakePaymentPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.PAYMENT_DETAILS);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  
  // Tenant data state
  const [tenantInfo, setTenantInfo] = useState({
    name: '',
    unit: '',
    property: '',
    rentAmount: '',
    nextPaymentDue: '',
    balance: '',
    leaseId: '',
    hasLease: false
  });
  
  // Form state
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    paymentType: 'rent',
    month: '',
    reference: `MPESA-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
  });
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  
  // Fetch tenant data
  useEffect(() => {
    async function fetchTenantData() {
      try {
        if (!user?.id) return;
        
        setLoadingData(true);
        setError(null);
        
        // Get tenant's active lease
        const lease = await getTenantLease(user.id);
        
        if (!lease) {
          setError('No active lease found. Please contact property management.');
          setLoadingData(false);
          return;
        }
        
        // Get payment summary
        const paymentSummary = await getTenantPaymentSummary(user.id);
        
        // Set tenant info with detailed unit information
        setTenantInfo({
          name: user.fullName || user.firstName + ' ' + (user.lastName || ''),
          unit: lease.unit?.unit_number || '',
          property: lease.unit?.property?.name || '',
          rentAmount: lease.rent_amount ? `KSh ${parseFloat(lease.rent_amount).toLocaleString()}` : paymentSummary.rentAmount,
          nextPaymentDue: paymentSummary.nextPaymentDue ? formatDate(paymentSummary.nextPaymentDue) : 'N/A',
          balance: paymentSummary.currentBalance,
          leaseId: lease.id,
          hasLease: true
        });
        
        // Set default payment amount - remove currency symbol and commas for calculation
        const cleanAmount = lease.rent_amount || paymentSummary.currentBalance.replace('KSh ', '').replace(/,/g, '');
        
        setPaymentDetails(prev => ({
          ...prev,
          amount: typeof cleanAmount === 'string' ? cleanAmount.replace('KSh ', '').replace(/,/g, '') : cleanAmount,
          month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }));
      } catch (err) {
        console.error('Error fetching tenant data:', err);
        setError('Failed to load tenant information. Please try again later.');
      } finally {
        setLoadingData(false);
      }
    }
    
    if (user) {
      fetchTenantData();
    }
  }, [user]);

  // Handle next step
  const handleNext = () => {
    if (step < STEPS.COMPLETE) {
      setStep(step + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (step > STEPS.PAYMENT_DETAILS) {
      setStep(step - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user?.id || !tenantInfo.leaseId) {
        throw new Error('Missing required information');
      }
      
      // Create payment in database with successful status for demo
      const result = await createPayment(user.id, {
        lease_id: tenantInfo.leaseId,
        amount: parseFloat(paymentDetails.amount),
        payment_method: paymentMethod,
        reference_number: paymentDetails.reference,
        status: 'completed' // Set status to completed for demo purposes
      });
      
      if (!result) {
        throw new Error('Failed to create payment');
      }
      
      // Show success step
      setStep(STEPS.COMPLETE);
    } catch (err) {
      console.error('Error creating payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render payment details step
  const renderPaymentDetails = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select 
              value={paymentDetails.paymentType} 
              onValueChange={(value) => setPaymentDetails({...paymentDetails, paymentType: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="deposit">Security Deposit</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="text"
              value={paymentDetails.month}
              onChange={(e) => setPaymentDetails({...paymentDetails, month: e.target.value})}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Current billing month</p>
          </div>
          
          <div>
            <Label htmlFor="amount">Amount (KSh)</Label>
            <Input 
              id="amount" 
              type="text" 
              value={paymentDetails.amount} 
              onChange={(e) => setPaymentDetails({...paymentDetails, amount: e.target.value})}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Amount based on your current balance</p>
          </div>
          
          <div>
            <Label htmlFor="reference">Payment Reference</Label>
            <Input 
              id="reference" 
              type="text" 
              value={paymentDetails.reference} 
              onChange={(e) => setPaymentDetails({...paymentDetails, reference: e.target.value})}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Auto-generated reference number</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button type="submit">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );

  // Render payment method step
  const renderPaymentMethod = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
      <div className="space-y-4">
        <RadioGroup 
          value={paymentMethod} 
          onValueChange={setPaymentMethod}
          className="grid grid-cols-1 gap-4"
        >
          <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="mpesa" id="mpesa" />
            <Label htmlFor="mpesa" className="flex items-center cursor-pointer">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">M-Pesa</p>
                <p className="text-sm text-gray-500">Pay using M-Pesa mobile money</p>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="bank" id="bank" />
            <Label htmlFor="bank" className="flex items-center cursor-pointer">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Bank Transfer</p>
                <p className="text-sm text-gray-500">Pay using bank transfer</p>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center cursor-pointer">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Credit/Debit Card</p>
                <p className="text-sm text-gray-500">Pay using Visa, Mastercard, or other cards</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
        
        {paymentMethod === 'mpesa' && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="font-medium mb-2">M-Pesa Payment Instructions</h3>
            <ol className="list-decimal list-inside text-sm space-y-2">
              <li>Go to M-Pesa on your phone</li>
              <li>Select "Lipa na M-Pesa"</li>
              <li>Select "Pay Bill"</li>
              <li>Enter Business Number: <span className="font-bold">123456</span></li>
              <li>Enter Account Number: <span className="font-bold">{paymentDetails.reference}</span></li>
              <li>Enter Amount: <span className="font-bold">KSh {parseFloat(paymentDetails.amount).toLocaleString()}</span></li>
              <li>Enter your M-Pesa PIN and confirm payment</li>
            </ol>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={handlePrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );

  // Render confirmation step
  const renderConfirmation = () => (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-4">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Type:</span>
              <span className="font-medium capitalize">{paymentDetails.paymentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Month:</span>
              <span className="font-medium">{paymentDetails.month}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">KSh {parseFloat(paymentDetails.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-medium capitalize">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reference:</span>
              <span className="font-medium">{paymentDetails.reference}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Important Information</h3>
              <p className="text-sm text-gray-600 mt-1">
                By clicking "Confirm Payment", you confirm that you have made the payment using the selected method.
                Your payment will be verified by the property manager within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={handlePrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Confirm Payment
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );

  // Render complete step
  const renderComplete = () => (
    <div className="text-center space-y-6">
      <div className="bg-green-100 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
        <Check className="h-12 w-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold">Payment Successful!</h2>
        <p className="text-gray-500 mt-2">
          Your payment of <span className="font-medium">KSh {parseFloat(paymentDetails.amount).toLocaleString()}</span> has been processed successfully.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md text-left">
        <h3 className="font-medium mb-4">Payment Details</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Reference Number:</span>
            <span className="font-medium">{paymentDetails.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method:</span>
            <span className="font-medium capitalize">{paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Completed
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Receipt Number:</span>
            <span className="font-medium">RCP-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/tenant/payments/history">View Payment History</Link>
        </Button>
        <Button asChild>
          <Link href="/tenant/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch(step) {
      case STEPS.PAYMENT_DETAILS:
        return renderPaymentDetails();
      case STEPS.PAYMENT_METHOD:
        return renderPaymentMethod();
      case STEPS.CONFIRMATION:
        return renderConfirmation();
      case STEPS.COMPLETE:
        return renderComplete();
      default:
        return renderPaymentDetails();
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="mb-8">
          <Link href="/tenant/payments/history" className="text-primary hover:underline inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payment History
          </Link>
          <h1 className="text-3xl font-bold mt-2">Make a Payment</h1>
        </div>
        
        {loadingData ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-10 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : !tenantInfo.hasLease ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground mb-4">You don't have an active lease. Please contact property management.</p>
              <Button asChild>
                <Link href="/tenant/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Tenant</dt>
                    <dd className="font-semibold mt-1">{tenantInfo.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Unit</dt>
                    <dd className="font-semibold mt-1">
                      {tenantInfo.unit ? (
                        <span className="inline-flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                            Unit {tenantInfo.unit}
                          </span>
                          {tenantInfo.property}
                        </span>
                      ) : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Monthly Rent</dt>
                    <dd className="font-semibold mt-1">{tenantInfo.rentAmount || 'KSh 0.00'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Next Payment Due</dt>
                    <dd className="font-semibold mt-1">{tenantInfo.nextPaymentDue || 'N/A'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-medium text-gray-500">Current Balance</dt>
                    <dd className="font-semibold text-lg text-primary mt-1">{tenantInfo.balance || 'KSh 0.00'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Progress indicator */}
            {step < STEPS.COMPLETE && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= STEPS.PAYMENT_DETAILS ? 'bg-primary text-white' : 'bg-muted'}`}>
                      1
                    </div>
                    <div className={`h-1 w-12 ${step > STEPS.PAYMENT_DETAILS ? 'bg-primary' : 'bg-muted'}`}></div>
                  </div>
                  <div className="flex items-center">
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= STEPS.PAYMENT_METHOD ? 'bg-primary text-white' : 'bg-muted'}`}>
                      2
                    </div>
                    <div className={`h-1 w-12 ${step > STEPS.PAYMENT_METHOD ? 'bg-primary' : 'bg-muted'}`}></div>
                  </div>
                  <div className="flex items-center">
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= STEPS.CONFIRMATION ? 'bg-primary text-white' : 'bg-muted'}`}>
                      3
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className={step >= STEPS.PAYMENT_DETAILS ? 'text-primary font-medium' : 'text-muted-foreground'}>
                    Payment Details
                  </span>
                  <span className={step >= STEPS.PAYMENT_METHOD ? 'text-primary font-medium' : 'text-muted-foreground'}>
                    Payment Method
                  </span>
                  <span className={step >= STEPS.CONFIRMATION ? 'text-primary font-medium' : 'text-muted-foreground'}>
                    Confirmation
                  </span>
                </div>
              </div>
            )}
            
            {step === STEPS.PAYMENT_DETAILS && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderPaymentDetails()}
                </CardContent>
              </Card>
            )}
            
            {step === STEPS.PAYMENT_METHOD && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderPaymentMethod()}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {step === STEPS.CONFIRMATION && (
              <Card>
                <CardHeader>
                  <CardTitle>Confirm Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderConfirmation()}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {step === STEPS.COMPLETE && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Payment Successful</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Thank You!</h3>
                  <p className="text-gray-500 mb-6">Your payment has been successfully processed.</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Reference:</span>
                      <span className="font-medium">{paymentDetails.reference}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-medium">KSh {parseFloat(paymentDetails.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium text-yellow-600">Pending</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" asChild>
                      <Link href="/tenant/payments/history">
                        <Receipt className="mr-2 h-4 w-4" />
                        View Payment History
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/tenant/dashboard">
                        Go to Dashboard
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
