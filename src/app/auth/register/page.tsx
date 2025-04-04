"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignUp } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // If already signed in, redirect
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-8 p-8 bg-background rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign up to manage your properties or tenant account
          </p>
        </div>

        <div className="mt-8">
          <SignUp redirectUrl="/dashboard" signInUrl="/sign-in" />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button 
              variant="link" 
              className="p-0" 
              onClick={() => router.push("/sign-in")}
            >
              Sign in
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
