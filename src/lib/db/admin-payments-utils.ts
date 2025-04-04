import { createSupabaseClient, createSupabaseAdminClient } from "@/lib/auth/auth-utils";

/**
 * Get all payments for admin management
 * @returns Array of payments with tenant and property details
 */
export async function getAdminPayments() {
  try {
    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenant:users(id, full_name, email),
        lease:leases(
          id, 
          unit_id,
          unit:units(
            id, 
            unit_number,
            property:properties(
              id, 
              name
            )
          )
        )
      `)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    return [];
  }
}

/**
 * Verify a payment
 * @param paymentId - The payment ID to verify
 * @param adminId - The admin user ID
 * @returns The updated payment or null if error
 */
export async function verifyPayment(paymentId: string, adminId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    
    // Update the payment status to verified
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_by: adminId,
        verification_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error verifying payment:', error);
    return null;
  }
}

/**
 * Reject a payment
 * @param paymentId - The payment ID to reject
 * @param adminId - The admin user ID
 * @param reason - The reason for rejection
 * @returns The updated payment or null if error
 */
export async function rejectPayment(paymentId: string, adminId: string, reason: string) {
  try {
    const supabase = createSupabaseAdminClient();
    
    // Update the payment status to rejected
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
        verified_by: adminId,
        verification_date: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error rejecting payment:', error);
    return null;
  }
}
