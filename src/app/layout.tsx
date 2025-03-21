import './globals.css'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ClerkProvider } from "@clerk/nextjs"

const geist = Geist({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Makao Rental Management System',
  description: 'A comprehensive rental property management system for Kenyan landlords',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={geist.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
