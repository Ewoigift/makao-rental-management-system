export type Property = {
  id: string;
  created_at: string;
  name: string;
  location: string;
  description: string;
  owner_id: string; // References the user who owns this property
  total_units: number;
  property_type: 'apartment' | 'house' | 'commercial';
  status: 'active' | 'inactive';
};

export type Unit = {
  id: string;
  created_at: string;
  property_id: string; // References the property this unit belongs to
  unit_number: string;
  floor_number?: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  rent_amount: number;
  status: 'vacant' | 'occupied' | 'maintenance';
  amenities: string[]; // Array of amenities
};

export type Tenant = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: 'active' | 'inactive' | 'pending';
};

export type Lease = {
  id: string;
  created_at: string;
  unit_id: string; // References the unit
  tenant_id: string; // References the tenant
  start_date: string;
  end_date: string;
  rent_amount: number;
  security_deposit: number;
  payment_day: number; // Day of month rent is due
  status: 'active' | 'ended' | 'terminated';
  documents: string[]; // Array of document URLs
};

export type Payment = {
  id: string;
  created_at: string;
  lease_id: string; // References the lease
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'mpesa' | 'other';
  status: 'pending' | 'completed' | 'failed';
  reference_number: string;
  notes?: string;
};

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Omit<Property, 'id' | 'created_at'>;
        Update: Partial<Omit<Property, 'id' | 'created_at'>>;
      };
      units: {
        Row: Unit;
        Insert: Omit<Unit, 'id' | 'created_at'>;
        Update: Partial<Omit<Unit, 'id' | 'created_at'>>;
      };
      tenants: {
        Row: Tenant;
        Insert: Omit<Tenant, 'id' | 'created_at'>;
        Update: Partial<Omit<Tenant, 'id' | 'created_at'>>;
      };
      leases: {
        Row: Lease;
        Insert: Omit<Lease, 'id' | 'created_at'>;
        Update: Partial<Omit<Lease, 'id' | 'created_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at'>;
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
      };
    };
  };
};
