"use client";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/properties", label: "Properties", icon: "🏠" },
    { href: "/units", label: "Units", icon: "🚪" },
    { href: "/tenants", label: "Tenants", icon: "👤" },
    { href: "/leases", label: "Leases", icon: "📄" },
    { href: "/payments", label: "Payments", icon: "💰" },
    { href: "/supabase-test", label: "Test Connection", icon: "🔧" },
  ];

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
        <div>
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </div>
      </div>
    </nav>
  );
}
