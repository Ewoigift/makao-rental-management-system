"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useUser } from "@clerk/nextjs";
import { MainLayout } from "@/components/layout/main-layout";
import { Loader2 } from "lucide-react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const router = useRouter();
  const { isLoading: authLoading, userRole } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn } = useUser();
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  useEffect(() => {
    // Only run this check client-side to avoid hydration issues
    if (!isClientSide) return;

    // Check if user is loaded and not signed in
    if (clerkLoaded && !isSignedIn) {
      router.push("/");
      return;
    }

    // Check if user role is loaded and doesn't match the required role
    if (clerkLoaded && isSignedIn && !authLoading && !userRole) {
      router.push("/");
    }
  }, [clerkLoaded, isSignedIn, authLoading, userRole, router, isClientSide]);

  // Show loading while checking authentication
  if (!isClientSide || authLoading || !clerkLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
