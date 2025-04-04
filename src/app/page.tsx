import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, HomeIcon, ArrowRight } from 'lucide-react'
import { redirect } from 'next/navigation'

// This is a server component
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="max-w-5xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-blue-600">
          Welcome to MAKAO
        </h1>
        <p className="text-xl md:text-2xl text-gray-600">
          Your comprehensive rental property management solution
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Tenant Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-left hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              <HomeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">I'm a Tenant</h2>
            <p className="text-gray-600 mb-6">
              Access your rental information, make payments, submit maintenance requests, and communicate with your property manager.
            </p>
            <Link href="/sign-in?role=tenant">
              <Button size="lg" className="w-full">
                Tenant Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="mt-4 text-center">
              <Link href="/sign-up?role=tenant" className="text-blue-600 hover:underline">
                New tenant? Register here
              </Link>
            </div>
          </div>
          
          {/* Landlord Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-left hover:shadow-xl transition-shadow">
            <div className="bg-green-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">I'm a Landlord</h2>
            <p className="text-gray-600 mb-6">
              Manage your properties, track rent payments, handle maintenance requests, and communicate with your tenants.
            </p>
            <Link href="/sign-in?role=landlord">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                Landlord Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="mt-4 text-center">
              <Link href="/sign-up?role=landlord" className="text-green-600 hover:underline">
                New landlord? Register here
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-gray-500 text-sm">
          <p>&copy; 2025 MAKAO Rental Management System. All rights reserved.</p>
        </div>
      </div>
    </main>
  )
}