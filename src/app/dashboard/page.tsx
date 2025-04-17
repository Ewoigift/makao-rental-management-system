"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { createSupabaseClient } from '@/lib/auth/auth-utils';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [redirectTarget, setRedirectTarget] = useState('');

  useEffect(() => {
    async function checkUserRole() {
      if (!user) return;
      
      try {
        // Create Supabase client
        const supabase = createSupabaseClient();
        
        // Get user data from the users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, user_type, role')
          .eq('clerk_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!userData) {
          // If no user found, redirect to role selection
          setRedirectTarget('role-select');
          router.push('/auth/choose-role');
          return;
        }
        
        // Redirect based on user type
        const userType = userData.user_type || userData.role; // Use either field
        
        if (userType === 'tenant') {
          setRedirectTarget('tenant');
          router.push('/tenant/dashboard');
        } else if (userType === 'admin' || userType === 'property_manager') {
          setRedirectTarget('admin');
          router.push('/admin/dashboard');
        } else {
          // If role is not recognized, redirect to role selection
          setRedirectTarget('role-select');
          router.push('/auth/choose-role');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // Default to role selection on error
        setRedirectTarget('role-select');
        router.push('/auth/choose-role');
      } finally {
        setIsRedirecting(false);
      }
    }

    if (isLoaded) {
      checkUserRole();
    }
  }, [user, router, isLoaded]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-gray-500">
        {isRedirecting 
          ? "Redirecting to your dashboard..." 
          : `Redirecting to ${redirectTarget} dashboard...`}
      </p>
    </div>
  );
}
