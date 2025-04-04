"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign in to manage your properties or tenant account
          </p>
        </div>

        <div className="mt-8">
          <SignIn redirectUrl="/dashboard" signUpUrl="/sign-up" />
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="p-0" onClick={() => router.push("/sign-up")}>
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
