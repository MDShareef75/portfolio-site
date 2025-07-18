import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Portal | Atoms Innovation',
  description: 'Track your project progress, payments, and communicate with the development team',
  robots: 'noindex, nofollow', // Keep client portals private
}

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {children}
    </div>
  )
} 