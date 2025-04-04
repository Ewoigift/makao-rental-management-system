import { createSupabaseClient } from "@/lib/auth/auth-utils";
import { formatKSh } from "@/lib/utils/currency";

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  lease?: {
    unit_id: string;
    unit?: {
      unit_number: string;
      property?: {
        name: string;
        address: string;
      }
    }
  };
}

/**
 * Get all payments for a tenant
 * @param tenantClerkId - The Clerk ID of the tenant
 * @returns Array of payments
 */
export async function getTenantPayments(tenantClerkId: string) {
  try {
    const supabase = createSupabaseClient();
    
    // First get the user's internal ID based on clerk_id
    const { data: userData, error: userIdError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', tenantClerkId)
      .single();
      
    if (userIdError) throw userIdError;
    
    // Get all payments for this tenant's leases
    const { data: leases, error: leasesError } = await supabase
      .from('leases')
      .select('id')
      .eq('tenant_id', userData.id)
      .eq('status', 'active');
      
    if (leasesError) throw leasesError;
    
    if (!leases || leases.length === 0) {
      return [];
    }
    
    const leaseIds = leases.map(lease => lease.id);
    
    // Get all payments for these leases
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        lease:leases(
          unit_id,
          unit:units(
            unit_number,
            property:properties(name, address)
          )
        )
      `)
      .in('lease_id', leaseIds)
      .order('payment_date', { ascending: false });
      
    if (paymentsError) throw paymentsError;
    
    return payments || [];
  } catch (error) {
    console.error('Error fetching tenant payments:', error);
    return [];
  }
}

/**
 * Create a new payment
 * @param tenantClerkId - The Clerk ID of the tenant
 * @param paymentData - The payment data
 * @returns The created payment or null if error
 */
export async function createPayment(
  tenantClerkId: string, 
  paymentData: {
    lease_id: string;
    amount: number;
    payment_method: string;
    reference_number: string;
    status?: string;
  }
) {
  try {
    console.log('Creating payment with data:', { tenantClerkId, paymentData });
    const supabase = createSupabaseClient();
    
    // Generate receipt number
    const receiptNumber = `RCP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create the payment - simplified for demo purposes
    const { data, error } = await supabase
      .from('payments')
      .insert({
        lease_id: paymentData.lease_id,
        amount: paymentData.amount,
        payment_date: new Date().toISOString(),
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.reference_number,
        payment_category: 'rent',
        status: paymentData.status || 'verified',
        receipt_number: receiptNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Payment created successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error; // Re-throw to see the actual error in the client
  }
}

/**
 * Get tenant's active lease
 * @param tenantClerkId - The Clerk ID of the tenant
 * @returns The tenant's active lease or null if not found
 */
export async function getTenantLease(tenantClerkId: string) {
  try {
    const supabase = createSupabaseClient();
    
    // First get the user's internal ID based on clerk_id
    const { data: userData, error: userIdError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', tenantClerkId)
      .single();
      
    if (userIdError) throw userIdError;
    
    // Get the tenant's active lease
    const { data: leaseData, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        unit:units(
          id,
          unit_number,
          property:properties(id, name, address)
        )
      `)
      .eq('tenant_id', userData.id)
      .eq('status', 'active')
      .single();
      
    if (leaseError) return null;
    
    return leaseData;
  } catch (error) {
    console.error('Error fetching tenant lease:', error);
    return null;
  }
}

/**
 * Get payment summary for a tenant
 * @param tenantClerkId - The Clerk ID of the tenant
 * @returns Payment summary object
 */
export async function getTenantPaymentSummary(tenantClerkId: string) {
  try {
    const supabase = createSupabaseClient();
    
    // Get tenant's active lease
    const lease = await getTenantLease(tenantClerkId);
    if (!lease) {
      return {
        totalPaid: formatKSh(0),
        currentBalance: formatKSh(0),
        nextPaymentDue: null,
        rentAmount: formatKSh(0),
        hasLease: false
      };
    }
    
    // Get all payments for this lease
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('lease_id', lease.id)
      .eq('status', 'completed');
      
    if (paymentsError) throw paymentsError;
    
    // Calculate total paid
    const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    
    // Calculate current month and check if payment exists
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Check if payment for current month exists
    const currentMonthPayment = payments?.find(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate.getMonth() + 1 === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    });
    
    // Set next payment due date (always set to 1st of next month for demo purposes)
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const nextPaymentDate = new Date(nextYear, nextMonth - 1, 1);
    const nextPaymentDue = nextPaymentDate.toISOString().split('T')[0];
    
    // Get the unit price from the lease
    const rentAmount = parseFloat(lease.rent_amount) || 30000;
    
    // Format the next payment date nicely
    const nextPaymentFormatted = nextPaymentDue ? new Date(nextPaymentDue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : null;
    
    return {
      totalPaid: formatKSh(totalPaid),
      currentBalance: formatKSh(rentAmount),
      nextPaymentDue,
      nextPaymentFormatted,
      rentAmount: formatKSh(rentAmount),
      hasLease: true
    };
  } catch (error) {
    console.error('Error fetching tenant payment summary:', error);
    return {
      totalPaid: formatKSh(0),
      currentBalance: formatKSh(0),
      nextPaymentDue: null,
      rentAmount: formatKSh(0),
      hasLease: false
    };
  }
}
