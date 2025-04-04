-- MAKAO Rental Management System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for enums
CREATE TYPE user_role AS ENUM ('admin', 'tenant', 'property_manager');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'commercial', 'mixed_use');
CREATE TYPE unit_status AS ENUM ('vacant', 'occupied', 'maintenance', 'renovation');
CREATE TYPE lease_status AS ENUM ('active', 'expired', 'terminated', 'pending');
CREATE TYPE payment_method AS ENUM ('mpesa', 'card', 'bank_transfer', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payment_category AS ENUM ('rent', 'deposit', 'penalty', 'other');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'emergency');
CREATE TYPE request_status AS ENUM ('submitted', 'in_review', 'scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'processed', 'disputed');
CREATE TYPE renovation_status AS ENUM ('planned', 'in_progress', 'completed', 'delayed');

-- Users Table (extended from auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  user_type user_role DEFAULT 'tenant',
  profile_picture_url TEXT,
  id_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clerk_id TEXT UNIQUE, -- Store Clerk user ID separately
  role TEXT DEFAULT 'tenant' -- Text-based role field for compatibility
);

-- Properties Table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  property_type property_type NOT NULL,
  total_units INTEGER NOT NULL,
  owner_id UUID REFERENCES users(id),
  manager_id UUID REFERENCES users(id),
  description TEXT,
  amenities JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Units Table
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor_number INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_feet INTEGER,
  rent_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  status unit_status DEFAULT 'vacant',
  features JSONB,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, unit_number)
);

-- Leases Table
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  lease_document_url TEXT,
  status lease_status DEFAULT 'pending',
  payment_day INTEGER NOT NULL, -- Day of month when rent is due
  special_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method payment_method,
  transaction_id TEXT,
  payment_proof_url TEXT,
  status payment_status DEFAULT 'pending',
  rejection_reason TEXT,
  payment_category payment_category DEFAULT 'rent',
  verified_by UUID REFERENCES users(id),
  verification_date TIMESTAMP WITH TIME ZONE,
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Requests Table
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority request_priority DEFAULT 'medium',
  status request_status DEFAULT 'submitted',
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  images TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  message_text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_to UUID, -- Can reference maintenance_requests or other entities
  related_type TEXT, -- E.g., 'maintenance_request', 'payment', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type,
  status notification_status DEFAULT 'pending',
  read BOOLEAN DEFAULT FALSE,
  related_to UUID, -- Can reference various entities
  related_type TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Templates Table
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type notification_type,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposit Refunds Table
CREATE TABLE deposit_refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES users(id),
  original_deposit DECIMAL(10,2) NOT NULL,
  deduction_amount DECIMAL(10,2) DEFAULT 0,
  refund_amount DECIMAL(10,2) NOT NULL,
  deduction_reasons JSONB,
  inspection_date DATE,
  inspector_id UUID REFERENCES users(id),
  refund_date DATE,
  refund_method payment_method,
  transaction_id TEXT,
  status refund_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Renovations Table
CREATE TABLE renovations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  status renovation_status DEFAULT 'planned',
  description TEXT NOT NULL,
  contractor_info JSONB,
  tasks JSONB, -- Array of tasks with completion status
  before_images TEXT[],
  after_images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 1. Policy for users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT 
USING (auth.uid()::text = id::text);

-- 2. Admin policy using a non-recursive approach
-- This policy allows selecting any row if the current user has the 'admin' role
-- We're using a direct auth.jwt() check instead of querying the users table
CREATE POLICY "Admins can view all user profiles" 
ON users FOR SELECT 
USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- 3. Policy for users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- 4. Admin policy for updating user profiles
CREATE POLICY "Admins can update any user profile" 
ON users FOR UPDATE
USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
WITH CHECK (true);

-- 5. Allow system-level inserts for webhook handlers
CREATE POLICY "Allow service role inserts" 
ON users FOR INSERT 
WITH CHECK (true);

-- Properties table policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties" 
ON properties FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert properties" 
ON properties FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

CREATE POLICY "Admins can update properties" 
ON properties FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

-- Units table policies
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view units" 
ON units FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert units" 
ON units FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

CREATE POLICY "Admins can update units" 
ON units FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

-- Leases table policies
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view their own leases" 
ON leases FOR SELECT 
USING (tenant_id = auth.uid());

CREATE POLICY "Admins can view all leases" 
ON leases FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

CREATE POLICY "Admins can insert leases" 
ON leases FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

CREATE POLICY "Admins can update leases" 
ON leases FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

-- Similar policies for other tables...
