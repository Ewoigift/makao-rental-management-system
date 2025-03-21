import Link from 'next/link';
import { Home, Building2, Users, Receipt, BarChart3, Settings } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Building2, label: 'Properties', href: '/properties' },
    { icon: Users, label: 'Tenants', href: '/tenants' },
    { icon: Receipt, label: 'Payments', href: '/payments' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex flex-col w-64 bg-white h-screen border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Makao</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
