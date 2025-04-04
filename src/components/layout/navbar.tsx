"use client";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useAuth } from "@/components/auth/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const { userRole, setUserRole, signOut } = useAuth();

  // Determine navigation items based on user role
  const landlordNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/properties", label: "Properties", icon: "🏢" },
    { href: "/units", label: "Units", icon: "🏠" },
    { href: "/tenants", label: "Tenants", icon: "👥" },
    { href: "/leases", label: "Leases", icon: "📝" },
    { href: "/payments", label: "Payments", icon: "💰" },
  ];

  const tenantNavItems = [
    { href: "/tenant/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/tenant/lease", label: "My Lease", icon: "📝" },
    { href: "/tenant/payments", label: "Payments", icon: "💰" },
    { href: "/tenant/maintenance", label: "Maintenance", icon: "🔧" },
    { href: "/tenant/notifications", label: "Notifications", icon: "🔔" },
  ];

  // Use appropriate nav items based on user role
  const navItems = userRole === "tenant" ? tenantNavItems : landlordNavItems;

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/" className="text-xl font-bold">
          Makao Rental
        </Link>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block mt-4 lg:inline-block lg:mt-0 text-gray-200 hover:text-white mr-4",
                pathname === item.href ? "text-white" : ""
              )}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-200">
                <span>{user?.fullName || user?.emailAddresses[0]?.emailAddress}</span>
                {userRole && (
                  <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-xs">
                    {userRole === "tenant" ? "Tenant" : "Landlord"}
                  </span>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
