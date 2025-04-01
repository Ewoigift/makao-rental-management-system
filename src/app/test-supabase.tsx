'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing connection...');

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase.from('_test').select('*').limit(1);
        if (error) throw error;
        setStatus('✅ Supabase connection successful!');
      } catch (error) {
        console.error('Connection error:', error);
        setStatus('❌ Connection error - check console for details');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 m-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Supabase Connection Test</h2>
      <p>{status}</p>
      <p className="text-sm mt-2">
        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
        <br />
        Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
      </p>
    </div>
  );
}
