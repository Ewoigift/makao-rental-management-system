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
export async function getTenantDashboardSummary(tenantId: string) {
  try {
    const supabase = createSupabaseClient();
    
    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', tenantId)
      .single();
      
    if (tenantError) throw tenantError;
    
    // Get lease info
    // First get the user's internal ID based on clerk_id
    const { data: userData, error: userIdError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', tenantId)
      .single();
      
    if (userIdError) throw userIdError;
    
    // Then get the lease using the internal user ID
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        units(unit_number, properties(name, address))
      `)
      .eq('tenant_id', userData.id)
      .eq('status', 'active')
      .single();
    
    // If no lease found, return basic tenant info with not allocated message
    if (leaseError || !lease) {
      return {
        tenant,
        lease: null,
        unit: null,
        currentBalance: 0,
        nextPaymentDue: null,
        notAllocated: true
      };
    }
    
    // Get payment info
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('lease_id', lease.id)
      .order('payment_date', { ascending: false });
    
    if (paymentsError) throw paymentsError;
    
    // Calculate current balance and next payment due
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
      const nextPaymentDate = new Date(currentYear, currentMonth, 1); // 1st of next month
      nextPaymentDue = nextPaymentDate.toISOString().split('T')[0];
    } else {
      // If current month is paid, next due date is 1st of the month after next
      const nextPaymentDate = new Date(currentYear, currentMonth, 1); // 1st of month after next
      nextPaymentDue = nextPaymentDate.toISOString().split('T')[0];
    }
    
    return {
      tenant,
      lease,
      unit: lease.units,
      payments: payments || [],
      currentBalance: currentMonthPayment ? 0 : parseFloat(lease.rent_amount),
      nextPaymentDue,
      notAllocated: false
    };
  } catch (error) {
    console.error('Error fetching tenant dashboard summary:', error);
    return null;
  }
}

export async function getLandlordDashboardSummary() {
  try {
    // Using admin client to bypass RLS policies that might be causing issues
    const supabase = createSupabaseAdminClient();
    
    // Get property count
    const { data: properties, error: propertyError } = await supabase
      .from('properties')
      .select('id');
    
    // Get tenant count - using users table with tenant role instead of tenants table
    const { data: tenants, error: tenantError } = await supabase
      .from('users')
      .select('id')
      .or('role.eq.tenant,user_type.eq.tenant');
    
    // Get monthly revenue
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();
    
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('amount')
      .gte('payment_date', startOfMonth)
      .lte('payment_date', endOfMonth);
    
    // Get occupancy rate (total units vs occupied units)
    const { data: totalUnits, error: totalUnitsError } = await supabase
      .from('units')
      .select('id, status');
    
    if (propertyError) {
      console.error('Error fetching properties:', propertyError);
    }
    
    if (tenantError) {
      console.error('Error fetching tenants:', tenantError);
    }
    
    if (paymentError) {
      console.error('Error fetching payments:', paymentError);
    }
    
    if (totalUnitsError) {
      console.error('Error fetching units:', totalUnitsError);
    }
    
    // Calculate total monthly revenue
    const monthlyRevenue = payments?.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0) || 0;
    
    // Calculate occupancy rate from the same query results
    const totalUnitCount = totalUnits?.length || 0;
    const occupiedUnitCount = totalUnits?.filter(unit => unit.status === 'occupied').length || 0;
    const occupancyRate = totalUnitCount > 0 ? Math.round((occupiedUnitCount / totalUnitCount) * 100) : 0;
    
    console.log('Dashboard data:', {
      propertyCount: properties?.length || 0,
      tenantCount: tenants?.length || 0,
      monthlyRevenue,
      occupancyRate
    });
    
    return {
      propertyCount: properties?.length || 0,
      tenantCount: tenants?.length || 0,
      monthlyRevenue,
      occupancyRate
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
