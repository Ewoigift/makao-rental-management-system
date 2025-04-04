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
      
      // Check for existing role in localStorage first
      const storedRole = localStorage.getItem("userRole");
      
      if (storedRole) {
        setUserRole(storedRole);
        setIsLoading(false);
        // Skip database sync if we already have the role
        return;
      }
      
      // Skip Supabase sync if we're in development and don't have a valid role key
      // Use a temporary role for development
      if (process.env.NODE_ENV === 'development' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('Development mode: Using default role');
        const defaultRole = 'landlord'; // Default role for development
        setUserRole(defaultRole);
        localStorage.setItem("userRole", defaultRole);
        handleRoleBasedRedirect(defaultRole);
        setIsLoading(false);
        return;
      }
      
      try {
        // Sync user data with Supabase
        await syncUserWithSupabase(user);
        
        // Get user role from Supabase
        const role = await getUserRole(user.id);
        
        if (role) {
          setUserRole(role);
          localStorage.setItem("userRole", role);
          handleRoleBasedRedirect(role);
        }
      } catch (supabaseError) {
        console.error("Supabase connection error:", supabaseError);
        
        // Fallback for development - set a default role
        if (process.env.NODE_ENV === 'development') {
          const defaultRole = 'landlord'; // Default role for development
          setUserRole(defaultRole);
          localStorage.setItem("userRole", defaultRole);
          handleRoleBasedRedirect(defaultRole);
        } else {
          throw supabaseError; // Re-throw in production
        }
      }
    } catch (error) {
      console.error("Error syncing user with Supabase:", error);
      setError("Failed to sync user data. Please try again.");
      router.push("/error");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for role-based redirects
  const handleRoleBasedRedirect = (role: string) => {
    if (role === "tenant") {
      router.push("/tenant/dashboard");
    } else if (role === "landlord") {
      router.push("/dashboard");
    }
  };

  // Update user role
  const updateRole = async (role: string) => {
    if (!isSignedIn || !user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Make API call to update role
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      setUserRole(role);
      localStorage.setItem("userRole", role);
      handleRoleBasedRedirect(role);
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update role. Please try again.");
      router.push("/error");
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
  }, [isLoaded, isSignedIn, user?.id]);

  // Check localStorage for role on initial load (for client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userRole");
      if (storedRole && !userRole) {
        setUserRole(storedRole);
        setIsLoading(false);
      }
    }
  }, [userRole]);

  return (
    <AuthContext.Provider value={{ isLoading, userRole, setUserRole, syncUser, updateRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
