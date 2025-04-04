"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { userRole } = useAuth();

  useEffect(() => {
    // Only redirect after Clerk has loaded
    if (!isLoaded) return;
    
    // If user is already signed in, redirect based on their role
    if (isSignedIn) {
      if (userRole === 'admin') {
        router.push("/admin/dashboard");
      } else {
        // Default to tenant dashboard if role isn't admin
        router.push("/tenant/dashboard");
      }
    }
  }, [isSignedIn, isLoaded, userRole, router]);

  return <>{children}</>;
