import { supabase } from '@/lib/supabase';
import type { Property } from '@/types/supabase';

export type CreatePropertyData = Omit<Property, 'id' | 'created_at'>;
export type UpdatePropertyData = Partial<CreatePropertyData>;

const getAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const propertiesService = {
  // Get all properties for the current user
  async getAllProperties() {
    try {
      const userId = await getAuth();

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          units: units(count)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error('Properties service error:', err);
      throw err instanceof Error ? err : new Error('Failed to fetch properties');
    }
  },

  // Get a single property by ID with its units
  async getProperty(id: string) {
    try {
      const userId = await getAuth();

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          units (
            id,
            unit_number,
            floor_number,
            bedrooms,
            bathrooms,
            square_feet,
            rent_amount,
            status,
            amenities
          )
        `)
        .eq('id', id)
        .eq('owner_id', userId)
        .single();

      if (error) {
        console.error('Error fetching property:', error);
        throw new Error(`Failed to fetch property: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error('Properties service error:', err);
      throw err instanceof Error ? err : new Error('Failed to fetch property');
    }
  },

  // Create a new property
  async createProperty(propertyData: CreatePropertyData) {
    try {
      const userId = await getAuth();

      console.log('Creating property with data:', {
        ...propertyData,
        owner_id: userId,
        status: 'active'
      });

      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          owner_id: userId,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw new Error(`Failed to create property: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error('Properties service error:', err);
      throw err instanceof Error ? err : new Error('Failed to create property');
    }
  },

  // Update an existing property
  async updateProperty(id: string, propertyData: UpdatePropertyData) {
    try {
      const userId = await getAuth();

      const { data, error } = await supabase
        .from('properties')
        .update({
          ...propertyData,
          owner_id: userId
        })
        .eq('id', id)
        .eq('owner_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        throw new Error(`Failed to update property: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error('Properties service error:', err);
      throw err instanceof Error ? err : new Error('Failed to update property');
    }
  },

  // Delete a property
  async deleteProperty(id: string) {
    try {
      const userId = await getAuth();

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('owner_id', userId);

      if (error) {
        console.error('Error deleting property:', error);
        throw new Error(`Failed to delete property: ${error.message}`);
      }
    } catch (err) {
      console.error('Properties service error:', err);
      throw err instanceof Error ? err : new Error('Failed to delete property');
    }
  },

  // Get property statistics
  async getPropertyStats() {
    try {
      const userId = await getAuth();

      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          units (
            status,
            rent_amount
          )
        `)
        .eq('owner_id', userId);

      if (error) {
        console.error('Error fetching property stats:', error);
        throw new Error(`Failed to fetch property stats: ${error.message}`);
      }

      // Calculate statistics
      const stats = {
        totalProperties: data.length,
        totalUnits: 0,
        occupiedUnits: 0,
        vacantUnits: 0,
        totalPotentialRevenue: 0,
        actualRevenue: 0,
      };

      data.forEach(property => {
        if (!property.units) return;
        
        stats.totalUnits += property.units.length;
        property.units.forEach(unit => {
          if (unit.status === 'occupied') {
            stats.occupiedUnits++;
            stats.actualRevenue += unit.rent_amount;
          } else if (unit.status === 'vacant') {
            stats.vacantUnits++;
          }
          stats.totalPotentialRevenue += unit.rent_amount;
        });
      });

      return stats;
    } catch (err) {
      console.error('Properties service error:', err);
      throw err instanceof Error ? err : new Error('Failed to fetch property stats');
    }
  }
};
