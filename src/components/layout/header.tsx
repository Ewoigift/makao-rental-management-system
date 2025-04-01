import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Users, Receipt, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard" className="font-semibold text-lg">
          Makao RMS
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link href="/properties" className="text-sm font-medium transition-colors hover:text-primary">
            <Button variant="ghost" className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Properties
            </Button>
          </Link>
          <Link href="/tenants" className="text-sm font-medium transition-colors hover:text-primary">
            <Button variant="ghost" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Tenants
            </Button>
          </Link>
          <Link href="/payments" className="text-sm font-medium transition-colors hover:text-primary">
            <Button variant="ghost" className="flex items-center">
              <Receipt className="h-4 w-4 mr-2" />
              Payments
            </Button>
          </Link>
          <Link href="/settings" className="text-sm font-medium transition-colors hover:text-primary">
            <Button variant="ghost" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
