"use client";

import { useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export default function CustomSignIn() {
  const router = useRouter();
  const { userRole, isLoading } = useAuth();
  
  // Redirect to dashboard if user is already authenticated and has a role
  useEffect(() => {
    if (!isLoading && userRole) {
      if (userRole === 'tenant') {
        router.push('/tenant/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    }
  }, [userRole, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          MAKAO
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-sm normal-case",
                footerActionLink: "text-blue-600 hover:text-blue-800",
                card: "rounded-xl shadow-md",
              },
            }}
            redirectUrl="/protected"
          />
        </div>
      </div>
    </div>
  );
}
