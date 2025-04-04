import { createSupabaseClient } from "@/lib/auth/auth-utils";

export interface MaintenanceRequest {
  id: string;
  tenant_id: string;
  unit_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  request_date: string;
  scheduled_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  images?: string[];
  unit?: {
    unit_number: string;
    property?: {
      name: string;
      address: string;
    }
  };
}



/**
 * Get all maintenance requests for a tenant
 * @param tenantClerkId - The Clerk ID of the tenant
 * @returns Array of maintenance requests
 */
export async function getTenantMaintenanceRequests(tenantClerkId: string) {
  try {
    const supabase = createSupabaseClient();
    
    // First get the user's internal ID based on clerk_id
    const { data: userData, error: userIdError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', tenantClerkId)
      .single();
      
    if (userIdError) throw userIdError;
    
    // Get all maintenance requests for this tenant
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        unit:units(
          unit_number,
          property:properties(name, address)
        )
      `)
      .eq('tenant_id', userData.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return [];
  }
}

/**
 * Create a new maintenance request
 * @param tenantClerkId - The Clerk ID of the tenant
 * @param requestData - The maintenance request data
 * @returns The created maintenance request or null if error
 */
export async function createMaintenanceRequest(
  tenantClerkId: string, 
  requestData: {
    unit_id: string;
    title: string;
    description: string;
    priority: string;
  }
) {
  try {
    const supabase = createSupabaseClient();
    
    // First get the user's internal ID based on clerk_id
    const { data: userData, error: userIdError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', tenantClerkId)
      .single();
      
    if (userIdError) throw userIdError;
    
    // Create the maintenance request
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert({
        tenant_id: userData.id,
        unit_id: requestData.unit_id,
        title: requestData.title,
        description: requestData.description,
        priority: requestData.priority,
        status: 'submitted',
        request_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (error) throw error;
    
    // Add initial update
    await supabase
      .from('maintenance_updates')
      .insert({
        request_id: data[0].id,
        message: 'Request submitted and pending review.',
        created_by: userData.id,
        created_at: new Date().toISOString()
      });
    
    return data[0];
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return null;
  }
}

/**
 * Get a tenant's leased unit
 * @param tenantClerkId - The Clerk ID of the tenant
 * @returns The tenant's leased unit or null if not found
 */
export async function getTenantUnit(tenantClerkId: string) {
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
    
    return leaseData.unit;
  } catch (error) {
    console.error('Error fetching tenant unit:', error);
    return null;
  }
}
