import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileNav, MobileBottomNav } from '@/components/mobile-nav'
import { ListTodo } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <MobileNav />
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ListTodo className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">TaskFlow</span>
        </Link>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
      
      <main className="flex-1 overflow-auto pt-14 pb-20 md:pt-0 md:pb-0">
        {children}
      </main>
      
      <MobileBottomNav />
    </div>
  )
}
