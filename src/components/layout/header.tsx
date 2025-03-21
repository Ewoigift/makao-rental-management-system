import { Bell, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { UserButton, useUser } from "@clerk/nextjs";

const Header = () => {
  const { user } = useUser();

  return (
    <header className="h-16 border-b bg-white">
      <div className="flex items-center justify-between h-full px-6">
        <div className="w-96">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{user?.fullName || 'Guest'}</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
