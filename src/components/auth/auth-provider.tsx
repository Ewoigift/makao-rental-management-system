"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { syncUserWithSupabase, getUserRole } from "@/lib/auth/auth-utils";
import { useRouter } from "next/navigation";

type AuthContextType = {
  isLoading: boolean;
  userRole: string | null;
  syncUser: () => Promise<void>;
  updateRole: (role: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userRole: null,
  syncUser: async () => {},
  updateRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
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
        handleRoleBasedRedirect(storedRole);
        return;
      }
      
      // Sync user data with Supabase
      await syncUserWithSupabase(user);
      
      // Get user role from Supabase
      const role = await getUserRole(user.id);
      
      if (role) {
        setUserRole(role);
        localStorage.setItem("userRole", role);
        handleRoleBasedRedirect(role);
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

  // Sync user on initial load and when Clerk user changes
  useEffect(() => {
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
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, userRole, syncUser, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
}
