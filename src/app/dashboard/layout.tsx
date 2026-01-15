import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <DashboardNav user={session.user} />
      <main className="w-full max-w-7xl mx-auto px-4 py-4 md:py-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
