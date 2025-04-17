"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Building2,
  Home,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Settings,
  Wrench,
  CreditCard,
  Bell,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { userRole } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  
  // Set role from localStorage on client-side
  useEffect(() => {
    // First try to use the role from context
    if (userRole) {
      console.log("Sidebar using role from context:", userRole);
      setRole(userRole);
    } else {
      // Fallback to localStorage
      const storedRole = localStorage.getItem("userRole");
      if (storedRole) {
        console.log("Sidebar using role from localStorage:", storedRole);
        setRole(storedRole);
      }
    }
  }, [userRole]);

  // Landlord navigation items
  const landlordNavItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/properties",
      label: "Properties",
      icon: Building2,
    },
    {
      href: "/units",
      label: "Units",
      icon: Home,
    },
    {
      href: "/tenants",
      label: "Tenants",
      icon: Users,
    },
    {
      href: "/leases",
      label: "Leases",
      icon: FileText,
    },
    {
      href: "/payments",
      label: "Payments",
      icon: DollarSign,
    },
    {
      href: "/maintenance",
      label: "Maintenance",
      icon: Wrench,
    },
    {
      href: "/calendar",
      label: "Calendar",
      icon: Calendar,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  // Tenant navigation items
  const tenantNavItems = [
    {
      href: "/tenant/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/tenant/maintenance",
      label: "Maintenance",
      icon: Wrench,
    },
    {
      href: "/tenant/payments",
      label: "Payments",
      icon: CreditCard,
    },
    {
      href: "/tenant/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      href: "/tenant/lease",
      label: "My Lease",
      icon: FileText,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  // Select navigation based on role
  // Admin users should see the landlord sidebar
  const navItems = (role === "tenant") ? tenantNavItems : landlordNavItems;

  return (
    <aside className="w-64 bg-background border-r border-border">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Makao</h1>
          <p className="text-sm text-muted-foreground">
            {role === "tenant" ? "Tenant Portal" : (role === "admin" ? "Admin Portal" : "Property Management System")}
          </p>
        </div>

        <nav className="space-y-1 flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-border">
          <Link 
            href="/sign-in" 
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </div>
    </aside>
  );
}
