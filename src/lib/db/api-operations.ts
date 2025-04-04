import { supabase } from "@/lib/supabase/client";

// Units operations
export async function getAllUnits() {
  const { data, error } = await supabase
    .from('units')
    .select(`
      *,
      property:properties(id, name, address, city, county, property_type)
    `);
  
  if (error) throw error;
  return data;
}

export async function getUnitById(unitId: string) {
  const { data, error } = await supabase
    .from('units')
    .select(`
      *,
      property:properties(id, name, address, city, county, property_type),
      leases(
        id, 
        start_date, 
        end_date, 
        rent_amount, 
        deposit_amount, 
        status,
        tenant_id,
        tenant:users(id, full_name, email, phone_number)
      )
    `)
    .eq('id', unitId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createUnit(unitData: any) {
  const { data, error } = await supabase
    .from('units')
    .insert(unitData)
    .select();
  
  if (error) throw error;
  return data;
}

export async function updateUnit(unitId: string, unitData: any) {
  const { data, error } = await supabase
    .from('units')
    .update(unitData)
    .eq('id', unitId)
    .select();
  
  if (error) throw error;
  return data;
}

export async function deleteUnit(unitId: string) {
  const { error } = await supabase
    .from('units')
    .delete()
    .eq('id', unitId);
  
  if (error) throw error;
  return true;
}

// Tenants operations
export async function getAllTenants() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_type', 'tenant');
  
  if (error) throw error;
  return data;
}

export async function getTenantById(tenantId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      leases(
        id, 
        start_date, 
        end_date, 
        rent_amount, 
        status,
        unit:units(id, unit_number, property_id, 
          property:properties(id, name, address))
      )
    `)
    .eq('id', tenantId)
    .eq('user_type', 'tenant')
    .single();
  
  if (error) throw error;
  return data;
}

export async function createTenant(tenantData: any) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      ...tenantData,
      user_type: 'tenant'
    })
    .select();
  
  if (error) throw error;
  return data;
}

export async function updateTenant(tenantId: string, tenantData: any) {
  const { data, error } = await supabase
    .from('users')
    .update(tenantData)
    .eq('id', tenantId)
    .eq('user_type', 'tenant')
    .select();
  
  if (error) throw error;
  return data;
}

// Leases operations
export async function getAllLeases() {
  const { data, error } = await supabase
    .from('leases')
    .select(`
      *,
      tenant:users(id, full_name, email, phone_number),
      unit:units(
        id, 
        unit_number, 
        property_id,
        property:properties(id, name, address)
      )
    `);
  
  if (error) throw error;
  return data;
}

export async function getLeaseById(leaseId: string) {
  const { data, error } = await supabase
    .from('leases')
    .select(`
      *,
      tenant:users(id, full_name, email, phone_number),
      unit:units(
        id, 
        unit_number, 
        property_id,
        property:properties(id, name, address)
      ),
      payments(*)
    `)
    .eq('id', leaseId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createLease(leaseData: any) {
  const { data, error } = await supabase
    .from('leases')
    .insert(leaseData)
    .select();
  
  if (error) throw error;
  return data;
}

export async function updateLease(leaseId: string, leaseData: any) {
  const { data, error } = await supabase
    .from('leases')
    .update(leaseData)
    .eq('id', leaseId)
    .select();
  
  if (error) throw error;
  return data;
}

// Payments operations
export async function getAllPayments() {
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
          property:properties(id, name)
        )
      )
    `)
    .order('payment_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getPaymentsByTenant(tenantId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      lease:leases(
        id, 
        unit_id,
        unit:units(
          id, 
          unit_number,
          property:properties(id, name)
        )
      )
    `)
    .eq('tenant_id', tenantId)
    .order('payment_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createPayment(paymentData: any) {
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select();
  
  if (error) throw error;
  return data;
}

export async function updatePayment(paymentId: string, paymentData: any) {
  const { data, error } = await supabase
    .from('payments')
    .update(paymentData)
    .eq('id', paymentId)
    .select();
  
  if (error) throw error;
  return data;
}

// Maintenance requests operations
export async function getAllMaintenanceRequests() {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      tenant:users(id, full_name, email),
      unit:units(
        id, 
        unit_number,
        property:properties(id, name)
      ),
      assigned:users(id, full_name)
    `)
    .order('request_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getMaintenanceRequestsByUnit(unitId: string) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      tenant:users(id, full_name, email),
      assigned:users(id, full_name)
    `)
    .eq('unit_id', unitId)
    .order('request_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getMaintenanceRequestsByTenant(tenantId: string) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      unit:units(
        id, 
        unit_number,
        property:properties(id, name)
      ),
      assigned:users(id, full_name)
    `)
    .eq('tenant_id', tenantId)
    .order('request_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createMaintenanceRequest(requestData: any) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert(requestData)
    .select();
  
  if (error) throw error;
  return data;
}

export async function updateMaintenanceRequest(requestId: string, requestData: any) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update(requestData)
    .eq('id', requestId)
    .select();
  
  if (error) throw error;
  return data;
}
