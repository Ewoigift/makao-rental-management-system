"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { syncUserWithSupabase, getUserRole } from "@/lib/auth/auth-utils";
import { useRouter } from "next/navigation";

type AuthContextType = {
  isLoading: boolean;
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  syncUser: () => Promise<void>;
  updateRole: (role: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userRole: null,
  setUserRole: () => {},
  syncUser: async () => {},
  updateRole: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sync user data with Supabase when Clerk user changes
  const syncUser = async () => {
    if (!isSignedIn || !user) {
      setIsLoading(false);
      setUserRole(null);
      localStorage.removeItem("userRole");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Syncing user with Supabase:', user.id);
      
      // Skip Supabase sync if we're in development and don't have a valid role key
      if (process.env.NODE_ENV === 'development' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('Development mode: Using default role');
        const defaultRole = 'tenant'; // Default role for development
        setUserRole(defaultRole);
        localStorage.setItem("userRole", defaultRole);
        setIsLoading(false);
        return;
      }
      
      // Always sync with Supabase first to ensure user exists in database
      const syncedUser = await syncUserWithSupabase(user);
      console.log('User sync result:', syncedUser ? 'Success' : 'Failed');
      
      if (syncedUser) {
        // User was synced successfully - use their role from Supabase
        const role = syncedUser.role;
        
        if (role) {
          console.log('User role found in Supabase:', role);
          setUserRole(role);
          localStorage.setItem("userRole", role);
        } else {
          // Default to tenant if no role found
          console.warn('No role found - defaulting to tenant');
          setUserRole('tenant');
          localStorage.setItem("userRole", 'tenant');
        }
      } else {
        // If sync failed, try to get role directly
        console.log('Trying to get role for user ID:', user.id);
        const role = await getUserRole(user.id);
        
        if (role) {
          console.log('User role found via direct query:', role);
          setUserRole(role);
          localStorage.setItem("userRole", role);
        } else {
          // Last resort default
          console.warn('No role found anywhere - defaulting to tenant');
          setUserRole('tenant');
          localStorage.setItem("userRole", 'tenant');
        }
      }
    } catch (error) {
      console.error("Error syncing user:", error);
      // Default to tenant role if there's an error
      setUserRole('tenant');
      localStorage.setItem("userRole", 'tenant');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle role-based redirects - only redirect after loading is complete
  const handleRoleBasedRedirect = (role: string) => {
    if (isLoading) return; // Skip redirects during loading
    
    if (role === "admin" || role === "landlord") {
      router.push("/admin/dashboard");
    } else if (role === "tenant") {
      router.push("/tenant/dashboard");
    } else {
      // If no valid role, redirect to error page
      router.push("/error");
    }
  };

  // Update user role
  const updateRole = async (role: string) => {
    if (!isSignedIn || !user) {
      console.error("Cannot update role: No authenticated user");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // In a real app, you would update the role in your database
      setUserRole(role);
      localStorage.setItem("userRole", role);
      handleRoleBasedRedirect(role);
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function - handles both Clerk signout and local cleanup
  const signOut = async () => {
    try {
      // Clear local state
      localStorage.removeItem("userRole");
      setUserRole(null);
      
      // Sign out from Clerk
      await clerkSignOut();
      
      // Redirect to homepage
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Sync user on initial load and when Clerk user changes
  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    if (isLoaded) {
      syncUser();
    }
  }, [isLoaded, isSignedIn, user]);

  // Handle redirects when user role changes
  useEffect(() => {
    if (userRole && !isLoading) {
      handleRoleBasedRedirect(userRole);
    }
  }, [userRole, isLoading]);

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userRole,
        setUserRole,
        syncUser,
        updateRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
