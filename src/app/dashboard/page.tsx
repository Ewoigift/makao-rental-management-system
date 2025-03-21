import { auth } from "@clerk/nextjs/server";
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Receipt, TrendingUp } from 'lucide-react';
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const stats = [
    {
      title: 'Total Properties',
      value: '12',
      icon: Building2,
      description: 'Active properties under management'
    },
    {
      title: 'Total Tenants',
      value: '48',
      icon: Users,
      description: 'Currently occupied units'
    },
    {
      title: 'Monthly Revenue',
      value: 'KES 480,000',
      icon: Receipt,
      description: 'Expected monthly rent'
    },
    {
      title: 'Occupancy Rate',
      value: '85%',
      icon: TrendingUp,
      description: 'Current occupancy rate'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
