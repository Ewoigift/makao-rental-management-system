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
  }
) {
  try {
    const supabase = createSupabaseClient();
    
    // Create the payment
    const { data, error } = await supabase
      .from('payments')
      .insert({
        lease_id: paymentData.lease_id,
        amount: paymentData.amount,
        payment_date: new Date().toISOString(),
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error creating payment:', error);
    return null;
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
    
    // Set next payment due date (1st of next month if not paid for current month)
    let nextPaymentDue = null;
    if (!currentMonthPayment) {
      // If payment day is specified in lease, use that day
      const paymentDay = lease.payment_day || 1;
      const nextPaymentDate = new Date(currentYear, currentMonth - 1, paymentDay);
      
      // If the payment date has passed, set to next month
      if (nextPaymentDate < currentDate) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      
      nextPaymentDue = nextPaymentDate.toISOString().split('T')[0];
    } else {
      // If current month is paid, next due date is 1st of the month after next
      const nextPaymentDate = new Date(currentYear, currentMonth, lease.payment_day || 1);
      nextPaymentDue = nextPaymentDate.toISOString().split('T')[0];
    }
    
    return {
      totalPaid: formatKSh(totalPaid),
      currentBalance: formatKSh(currentMonthPayment ? 0 : parseFloat(lease.rent_amount)),
      nextPaymentDue,
      rentAmount: formatKSh(parseFloat(lease.rent_amount)),
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
