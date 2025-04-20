"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Home, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export default function ChooseRolePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { updateRole } = useAuth();
  const { user, isLoaded } = useUser();

  const handleRoleSelection = async (role: "admin" | "tenant") => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log(`Setting user role to: ${role}`);
      
      // First, update the role via the API
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to set user role");
      }

      // Now update the local context
      await updateRole(role);

      // Redirect based on role
      if (role === "admin") {
        console.log("Selected admin role, redirecting to admin dashboard");
        router.push("/admin/dashboard");
      } else {
        console.log("Selected tenant role, redirecting to tenant dashboard");
        router.push("/tenant/dashboard");
      }
    } catch (error: any) {
      console.error("Error setting user role:", error);
      setError(error.message || "Failed to set user role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-4xl w-full p-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to Makao Rental Management</CardTitle>
            <CardDescription>
              Please select your role to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="flex-1 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => !isSubmitting && handleRoleSelection("admin")}>
                <CardHeader className="text-center">
                  <Building2 className="h-12 w-12 mx-auto text-primary" />
                  <CardTitle>I am a Landlord/Property Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Manage your properties, units, tenants, and collect rent payments.
                  </p>
                  <ul className="list-disc list-inside mt-3 text-sm text-gray-600">
                    <li>Add and manage properties</li>
                    <li>Track payments and expenses</li>
                    <li>Manage tenant applications</li>
                    <li>Handle maintenance requests</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelection("admin");
                    }}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Select Landlord
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex-1 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => !isSubmitting && handleRoleSelection("tenant")}>
                <CardHeader className="text-center">
                  <Home className="h-12 w-12 mx-auto text-primary" />
                  <CardTitle>I am a Tenant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View your lease, make payments, and submit maintenance requests.
                  </p>
                  <ul className="list-disc list-inside mt-3 text-sm text-gray-600">
                    <li>View and pay rent</li>
                    <li>Submit maintenance requests</li>
                    <li>Access lease documents</li>
                    <li>Communicate with property management</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelection("tenant");
                    }}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Select Tenant
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-center">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
