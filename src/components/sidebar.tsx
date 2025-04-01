"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  Home,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
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

  return (
    <aside className={cn("w-64", "bg-background", "border-r", "border-border")}>
      <div className={cn("p-4")}>
        <div className={cn("mb-6")}>
          <h1 className={cn("text-xl", "font-bold")}>Makao</h1>
          <p className={cn("text-sm", "text-muted-foreground")}>Property Management System</p>
        </div>

        <nav className={cn("space-y-1")}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex",
                "items-center",
                "gap-3",
                "rounded-md",
                "px-3",
                "py-2",
                "text-sm",
                "font-medium",
                "transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/5"
              )}
            >
              <item.icon className={cn("h-4", "w-4")} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
