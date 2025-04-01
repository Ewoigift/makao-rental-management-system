import { supabase } from '@/lib/supabase';
import type { Unit } from '@/types/supabase';

export type CreateUnitData = Omit<Unit, 'id' | 'created_at'>;
export type UpdateUnitData = Partial<CreateUnitData>;

export const unitsService = {
  // Get all units for a property
  async getPropertyUnits(propertyId: string) {
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        leases (
          id,
          start_date,
          end_date,
          rent_amount,
          tenants (
            id,
            first_name,
            last_name
          )
        )
      `)
      .eq('property_id', propertyId)
      .order('unit_number');

    if (error) throw error;
    return data;
  },

  // Get a single unit by ID
  async getUnit(id: string) {
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        leases (
          id,
          start_date,
          end_date,
          rent_amount,
          tenants (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new unit
  async createUnit(unitData: CreateUnitData) {
    const { data, error } = await supabase
      .from('units')
      .insert(unitData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing unit
  async updateUnit(id: string, unitData: UpdateUnitData) {
    const { data, error } = await supabase
      .from('units')
      .update(unitData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a unit
  async deleteUnit(id: string) {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
