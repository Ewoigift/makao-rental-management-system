"use client";

import { useEffect } from "react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomSignUp() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "tenant";
  
  // Set role in localStorage for later use
  useEffect(() => {
    if (role) {
      localStorage.setItem("preferredRole", role);
    }
  }, [role]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          MAKAO
        </h1>
        
        <Tabs defaultValue={role} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="tenant" 
              className={role === "tenant" ? "data-[state=active]:bg-blue-100" : ""}
              onClick={() => {
                // Use Next.js router to update the URL
                const url = new URL(window.location.href);
                url.searchParams.set("role", "tenant");
                window.history.pushState({}, "", url);
                localStorage.setItem("preferredRole", "tenant");
              }}
            >
              Tenant
            </TabsTrigger>
            <TabsTrigger 
              value="landlord"
              className={role === "landlord" ? "data-[state=active]:bg-green-100" : ""}
              onClick={() => {
                // Use Next.js router to update the URL
                const url = new URL(window.location.href);
                url.searchParams.set("role", "landlord");
                window.history.pushState({}, "", url);
                localStorage.setItem("preferredRole", "landlord");
              }}
            >
              Landlord
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tenant" className="mt-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Tenant Sign Up</h2>
              <p className="text-gray-600 mb-6">
                Create an account to access your rental dashboard, make payments, and submit maintenance requests.
              </p>
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                    footerActionLink: "text-blue-600 hover:text-blue-700",
                    card: "shadow-none",
                  }
                }}
                redirectUrl="/auth/role-select"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="landlord" className="mt-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Landlord Sign Up</h2>
              <p className="text-gray-600 mb-6">
                Create an account to manage your properties, track payments, and handle maintenance requests.
              </p>
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-green-600 hover:bg-green-700",
                    footerActionLink: "text-green-600 hover:text-green-700",
                    card: "shadow-none",
                  }
                }}
                redirectUrl="/auth/role-select"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
