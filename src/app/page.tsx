import Link from 'next/link'
import { Button } from '@/components/ui/button'
import TestSupabase from './test-supabase';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full text-center space-y-8">
        <h1 className="text-6xl font-bold">
          Welcome to Makao
        </h1>
        <p className="text-2xl text-gray-600">
          Your comprehensive rental property management solution
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
      <TestSupabase />
    </main>
  )
}