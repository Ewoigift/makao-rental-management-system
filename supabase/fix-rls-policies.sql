-- Fix for infinite recursion in RLS policies

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all user profiles" ON users;
DROP POLICY IF EXISTS "Admins can update any user profile" ON users;

-- Create new policies using auth.jwt() instead of recursive queries
CREATE POLICY "Admins can view all user profiles" 
ON users FOR SELECT 
USING ((auth.jwt() ->> 'user_type')::text = 'admin');

CREATE POLICY "Admins can update any user profile" 
ON users FOR UPDATE
USING ((auth.jwt() ->> 'user_type')::text = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_type')::text = 'admin');

-- Also update the properties policies to use the same approach
DROP POLICY IF EXISTS "Admins can insert properties" ON properties;
DROP POLICY IF EXISTS "Admins can update properties" ON properties;

CREATE POLICY "Admins can insert properties" 
ON properties FOR INSERT 
WITH CHECK ((auth.jwt() ->> 'user_type')::text = 'admin');

CREATE POLICY "Admins can update properties" 
ON properties FOR UPDATE
USING ((auth.jwt() ->> 'user_type')::text = 'admin');
