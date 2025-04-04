"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/components/auth/auth-provider";
import { MainLayout } from "@/components/layout/main-layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { isSignedIn, isLoaded } = useUser();
  const { userRole, isLoading } = useAuth();

  useEffect(() => {
    // Only check after Clerk has loaded
    if (!isLoaded || isLoading) return;

    // If not signed in, redirect to sign-in
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    // If signed in and we have a role, redirect to the appropriate dashboard
    if (isSignedIn && userRole && !isLoading) {
      if (userRole === 'tenant') {
        router.push('/tenant/dashboard');
      } else if (userRole === 'admin' || userRole === 'landlord') {
        router.push('/admin/dashboard');
      } else {
        // If we have an invalid role, default to tenant
        console.log('Invalid role found:', userRole, 'defaulting to tenant');
        router.push('/tenant/dashboard');
      }
      return;
    }
    
    // If signed in but no role yet, default to tenant
    if (isSignedIn && !userRole && !isLoading) {
      console.log('No role found yet, defaulting to tenant');
      router.push('/tenant/dashboard');
      return;
    }
  }, [isSignedIn, isLoaded, userRole, isLoading, router]);

  // Show nothing while loading
  if (isLoading || !isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
