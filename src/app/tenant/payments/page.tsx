"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PaymentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the payment history page
    router.push('/tenant/payments/history');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-gray-500">Redirecting to payment history...</p>
    </div>
  );
}
