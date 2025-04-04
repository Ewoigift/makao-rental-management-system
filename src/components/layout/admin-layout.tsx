"use client";

import { ReactNode } from "react";
import { Navbar } from "./navbar";
import Link from "next/link";
import { 
  Home, 
  Users, 
  Building2, 
  FileText, 
  Banknote, 
  Settings, 
  ArrowLeft,
  Bell, 
  HelpCircle 
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Admin Sidebar */}
      <div className="w-64 bg-secondary p-4 space-y-8 hidden md:block">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Makao Admin</h2>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase font-bold px-3 mb-2">Dashboard</p>
          <Link 
            href="/admin/dashboard" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary-foreground/10"
          >
            <Home className="h-4 w-4 mr-3" />
            Dashboard
          </Link>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase font-bold px-3 mb-2">Property Management</p>
          <Link 
            href="/admin/properties" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary-foreground/10"
          >
            <Building2 className="h-4 w-4 mr-3" />
            Properties
          </Link>
          <Link 
            href="/admin/tenants" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary-foreground/10"
          >
            <Users className="h-4 w-4 mr-3" />
            Tenants
          </Link>
          <Link 
            href="/admin/leases" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary-foreground/10"
          >
            <FileText className="h-4 w-4 mr-3" />
            Leases
          </Link>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase font-bold px-3 mb-2">Finance</p>
          <Link 
            href="/admin/payments" 
            className="flex items-center px-3 py-2 text-sm bg-secondary-foreground/10 rounded-lg"
          >
            <Banknote className="h-4 w-4 mr-3" />
            Payments
          </Link>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase font-bold px-3 mb-2">Maintenance</p>
          <Link 
            href="/admin/maintenance" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary-foreground/10"
          >
            <Bell className="h-4 w-4 mr-3" />
            Maintenance Requests
          </Link>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase font-bold px-3 mb-2">Admin</p>
          <Link 
            href="/admin/settings" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary-foreground/10"
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Link>
        </div>
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <Link 
            href="/" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 mr-3" />
            Back to Site
          </Link>
          <Link 
            href="/help" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary-foreground/10"
          >
            <HelpCircle className="h-4 w-4 mr-3" />
            Help & Support
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
