import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supabase Connection Test',
  description: 'Test your Supabase connection',
};

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto p-6">
      <TestSupabaseConnection />
    </div>
  );
}

// Create a separate Client Component
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function TestSupabaseConnection() {
  const [testResult, setTestResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test the connection by getting the user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }

        // Test database connection
        const { data, error: dbError } = await supabase
          .from('properties')
          .select('id, name')
          .limit(1);

        if (dbError) {
          throw dbError;
        }

        // Test RLS policies
        const { data: testProperty, error: rlsError } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user?.id)
          .limit(1);

        if (rlsError) {
          throw rlsError;
        }

        setTestResult(
          `Connection successful!\n` +
          `User: ${user?.email || 'Not logged in'}\n` +
          `Database: ${data?.length ? 'Connected' : 'No data found'}\n` +
          `RLS Policies: ${testProperty?.length ? 'Working' : 'Not working'}\n`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    testConnection();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      {testResult && (
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <pre className="text-green-800">{testResult}</pre>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <pre className="text-red-800">{error}</pre>
        </div>
      )}
    </div>
  );
}
