import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Atoms Innovation Referral System',
  description: 'Manage referrers, clients, and track rewards in the Atoms Innovation referral system',
  robots: 'noindex, nofollow', // Keep admin pages private
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {children}
    </div>
  )
} 