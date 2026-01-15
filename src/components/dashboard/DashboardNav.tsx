'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Shield, LogOut, FolderOpen, FileText, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return 'U'
}

export function DashboardNav({ user }: DashboardNavProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const initials = getInitials(user.name, user.email)

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">ScopeShield AI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
                Projects
              </Link>
              <Link
                href="/dashboard/templates"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="h-4 w-4" />
                Templates
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-foreground">
                  {initials}
                </span>
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user.name || user.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
