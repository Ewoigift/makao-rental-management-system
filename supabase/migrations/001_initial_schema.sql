-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create properties table
create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  location text not null,
  description text,
  owner_id uuid not null,
  total_units integer not null default 0,
  property_type text not null check (property_type in ('apartment', 'house', 'commercial')),
  status text not null default 'active' check (status in ('active', 'inactive'))
);

-- Create units table
create table if not exists public.units (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  unit_number text not null,
  floor_number text,
  bedrooms integer not null default 1,
  bathrooms integer not null default 1,
  square_feet numeric(10,2) not null,
  rent_amount numeric(10,2) not null,
  status text not null default 'vacant' check (status in ('vacant', 'occupied', 'maintenance')),
  amenities text[] default array[]::text[],
  unique(property_id, unit_number)
);

-- Create tenants table
create table if not exists public.tenants (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text not null,
  emergency_contact jsonb not null,
  status text not null default 'pending' check (status in ('active', 'inactive', 'pending'))
);

-- Create leases table
create table if not exists public.leases (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unit_id uuid references public.units(id) on delete restrict not null,
  tenant_id uuid references public.tenants(id) on delete restrict not null,
  start_date date not null,
  end_date date not null,
  rent_amount numeric(10,2) not null,
  security_deposit numeric(10,2) not null,
  payment_day integer not null check (payment_day between 1 and 31),
  status text not null default 'active' check (status in ('active', 'ended', 'terminated')),
  documents text[] default array[]::text[],
  check (end_date > start_date)
);

-- Create payments table
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lease_id uuid references public.leases(id) on delete restrict not null,
  amount numeric(10,2) not null check (amount > 0),
  payment_date timestamp with time zone not null,
  payment_method text not null check (payment_method in ('cash', 'bank_transfer', 'mpesa', 'other')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  reference_number text not null,
  notes text
);

-- Create indexes for better query performance
create index if not exists idx_properties_owner on public.properties(owner_id);
create index if not exists idx_units_property on public.units(property_id);
create index if not exists idx_leases_unit on public.leases(unit_id);
create index if not exists idx_leases_tenant on public.leases(tenant_id);
create index if not exists idx_payments_lease on public.payments(lease_id);

-- Enable Row Level Security (RLS)
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.payments enable row level security;

-- Create policies
-- Properties: Users can only see and manage their own properties
create policy "Users can view their own properties"
  on public.properties for select
  using (auth.uid() = owner_id);

create policy "Users can insert their own properties"
  on public.properties for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own properties"
  on public.properties for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own properties"
  on public.properties for delete
  using (auth.uid() = owner_id);

-- Units: Users can manage units in their properties
create policy "Users can view units in their properties"
  on public.units for select
  using (exists (
    select 1 from public.properties
    where properties.id = units.property_id
    and properties.owner_id = auth.uid()
  ));

-- Similar policies need to be created for other tables
-- Add more policies based on your specific access requirements
