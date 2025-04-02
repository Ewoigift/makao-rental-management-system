import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Check, CreditCard, Receipt, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  
  // Form state
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '25000',
    paymentType: 'rent',
    month: 'May 2025',
    reference: `RENT-${Math.floor(Math.random() * 10000)}`
  });
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  
  // Sample tenant data - would come from database
  const tenantInfo = {
    name: 'John Doe',
    unit: 'A101',
    property: 'Sunset Apartments',
    rentAmount: 'KES 25,000',
    nextPaymentDue: '2025-05-01',
    balance: 'KES 0',
  };

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
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(STEPS.COMPLETE);
    }, 2000);
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
            <Select 
              value={paymentDetails.month} 
              onValueChange={(value) => setPaymentDetails({...paymentDetails, month: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="May 2025">May 2025</SelectItem>
                <SelectItem value="June 2025">June 2025</SelectItem>
                <SelectItem value="July 2025">July 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input 
              id="amount" 
              type="text" 
              value={paymentDetails.amount} 
              onChange={(e) => setPaymentDetails({...paymentDetails, amount: e.target.value})}
            />
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
              <li>Enter Amount: <span className="font-bold">KES {paymentDetails.amount}</span></li>
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
              <span className="font-medium">KES {paymentDetails.amount}</span>
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
        <h2 className="text-2xl font-bold">Payment Submitted</h2>
        <p className="text-gray-500 mt-2">
          Your payment of <span className="font-medium">KES {paymentDetails.amount}</span> has been submitted successfully.
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
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Pending Verification
            </span>
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Make a Payment</h1>
          <p className="text-gray-500">Complete the form below to make a payment</p>
        </div>
        
        {/* Progress indicator */}
        {step < STEPS.COMPLETE && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= STEPS.PAYMENT_DETAILS ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <div className={`h-1 w-12 ${step > STEPS.PAYMENT_DETAILS ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              </div>
              <div className="flex items-center">
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= STEPS.PAYMENT_METHOD ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <div className={`h-1 w-12 ${step > STEPS.PAYMENT_METHOD ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              </div>
              <div className="flex items-center">
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= STEPS.CONFIRMATION ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className={step >= STEPS.PAYMENT_DETAILS ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                Payment Details
              </span>
              <span className={step >= STEPS.PAYMENT_METHOD ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                Payment Method
              </span>
              <span className={step >= STEPS.CONFIRMATION ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                Confirmation
              </span>
            </div>
          </div>
        )}
        
        <Card>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
