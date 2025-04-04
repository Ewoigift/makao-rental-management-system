"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, LogOut, UserCircle, Settings, Bell, HelpCircle } from "lucide-react";
import { UserButton, SignInButton, useUser, UserProfile, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { useAuth } from "@/components/auth/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const { userRole, signOut } = useAuth();
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/" className="text-xl font-bold">
          Makao Rental
        </Link>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto justify-end">
        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-200">
                <span className="mr-2">{getGreeting()},</span>
                <span className="font-medium">{user?.fullName || user?.emailAddresses[0]?.emailAddress}</span>
                {userRole && (
                  <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-xs">
                    {userRole === "tenant" ? "Tenant" : "Landlord"}
                  </span>
                )}
              </div>
              
              {/* Clerk UserButton with full functionality */}
              <ClerkLoading>
                <div className="h-10 w-10 rounded-full bg-gray-700 animate-pulse"></div>
              </ClerkLoading>
              
              <ClerkLoaded>
                <UserButton 
                  afterSignOutUrl="/" 
                  userProfileUrl="/profile"
                  userProfileMode="modal"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-10 w-10",
                      userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-primary"
                    }
                  }}
                />
              </ClerkLoaded>
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button variant="default" size="sm">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}
