import { createSupabaseClient, createSupabaseAdminClient } from '../auth/auth-utils';

// Property related functions
export async function getProperties() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export async function getPropertyById(id: string) {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        units(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error);
    return null;
  }
}

// Unit related functions
export async function getUnits() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        properties(name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching units:', error);
    return [];
  }
}

export async function getUnitById(id: string) {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        properties(*),
        leases(
          *,
          tenants(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching unit with ID ${id}:`, error);
    return null;
  }
}

// Tenant related functions
export async function getTenants() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        leases(
          *,
          units(
            *,
            properties(name)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return [];
  }
}

export async function getTenantById(id: string) {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        leases(
          *,
          units(
            *,
            properties(*)
          ),
          payments(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching tenant with ID ${id}:`, error);
    return null;
  }
}

// Lease related functions
export async function getLeases() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants(*),
        units(
          *,
          properties(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching leases:', error);
    return [];
  }
}

// Payment related functions
export async function getPayments() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        leases(
          *,
          tenants(full_name),
          units(
            unit_number,
            properties(name)
          )
        )
      `)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

// Tenant specific functions
export async function getTenantDetails(tenantId: string) {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        leases(
          *,
          units(
            *,
            properties(*)
          )
        )
      `)
      .eq('id', tenantId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching tenant details with ID ${tenantId}:`, error);
    return null;
  }
}

export async function getTenantPayments(tenantId: string) {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        leases(
          *,
          units(
            unit_number,
            properties(name)
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching payments for tenant with ID ${tenantId}:`, error);
    return [];
  }
}

export async function getTenantMaintenanceRequests(tenantId: string) {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        units(
          unit_number,
          properties(name)
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching maintenance requests for tenant with ID ${tenantId}:`, error);
    return [];
  }
}

// Dashboard summary functions
export async function getLandlordDashboardSummary() {
  try {
    const supabase = createSupabaseClient();
    
    // Get property count
    const { data: properties, error: propertyError } = await supabase
      .from('properties')
      .select('id', { count: 'exact' })
      .eq('is_active', true);
    
    // Get tenant count
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('id', { count: 'exact' })
      .eq('is_active', true);
    
    // Get monthly revenue
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('amount')
      .gte('payment_date', new Date(new Date().setDate(1)).toISOString())
      .lt('payment_date', new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toISOString());
    
    // Get occupancy rate (total units vs occupied units)
    const { data: totalUnits, error: totalUnitsError } = await supabase
      .from('units')
      .select('id', { count: 'exact' })
      .eq('is_active', true);
    
    const { data: occupiedUnits, error: occupiedUnitsError } = await supabase
      .from('units')
      .select('id', { count: 'exact' })
      .eq('status', 'occupied');
    
    if (propertyError || tenantError || paymentError || totalUnitsError || occupiedUnitsError) {
      throw new Error('Error fetching dashboard data');
    }
    
    // Calculate total monthly revenue
    const monthlyRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    
    // Calculate occupancy rate
    const totalUnitCount = totalUnits?.length || 0;
    const occupiedUnitCount = occupiedUnits?.length || 0;
    const occupancyRate = totalUnitCount > 0 ? (occupiedUnitCount / totalUnitCount) * 100 : 0;
    
    return {
      propertyCount: properties?.length || 0,
      tenantCount: tenants?.length || 0,
      monthlyRevenue,
      occupancyRate: Math.round(occupancyRate)
    };
  } catch (error) {
    console.error('Error fetching landlord dashboard summary:', error);
    return {
      propertyCount: 0,
      tenantCount: 0,
      monthlyRevenue: 0,
      occupancyRate: 0
    };
  }
}
