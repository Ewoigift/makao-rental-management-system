"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, HomeIcon, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function RoleSelectPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const handleRoleSelect = async (role: "tenant" | "landlord") => {
    setIsSubmitting(true);
    setError("");

    try {
      // Check if user already exists in Supabase
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        throw fetchError;
      }

      if (existingUser) {
        // User exists, update role if different
        if (existingUser.role !== role) {
          const { error: updateError } = await supabase
            .from("users")
            .update({ role })
            .eq("clerk_id", user.id);

          if (updateError) throw updateError;
        }
      } else {
        // User doesn't exist, create new user
        const { error: insertError } = await supabase.from("users").insert({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          first_name: user.firstName,
          last_name: user.lastName,
          role,
          phone: user.primaryPhoneNumber?.phoneNumber,
          created_at: new Date().toISOString(),
        });

        if (insertError) throw insertError;
      }

      // Redirect based on role
      if (role === "tenant") {
        router.push("/tenant/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Error setting user role:", err);
      setError(err.message || "Failed to set user role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to MAKAO</h1>
          <p className="mt-2 text-gray-600">
            Please select your role to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => !isSubmitting && handleRoleSelect("tenant")}
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <HomeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>I'm a Tenant</CardTitle>
                  <CardDescription>
                    Access your rental information and services
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                As a tenant, you can make payments, submit maintenance requests,
                and communicate with your property manager.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("tenant");
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue as Tenant"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => !isSubmitting && handleRoleSelect("landlord")}
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>I'm a Landlord</CardTitle>
                  <CardDescription>
                    Manage your properties and tenants
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                As a landlord, you can manage your properties, track rent
                payments, handle maintenance requests, and communicate with your
                tenants.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("landlord");
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue as Landlord"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
