"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-gray-600 mb-8">We encountered an error while processing your request.</p>
      <div className="space-x-4">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
        >
          Go Home
        </Button>
        <Button
          onClick={() => router.refresh()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
