'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Shield, LogOut, FolderOpen, FileText, Menu, X } from 'lucide-react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const initials = getInitials(user.name, user.email)

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="font-bold text-base md:text-lg">ScopeShield AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FolderOpen className="h-4 w-4" />
              Projects
            </Link>
            <Link
              href="/dashboard/templates"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Templates
            </Link>
          </nav>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {initials}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user.name || user.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {initials}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-2 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FolderOpen className="h-5 w-5" />
                Projects
              </Link>
              <Link
                href="/dashboard/templates"
                className="flex items-center gap-3 px-2 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText className="h-5 w-5" />
                Templates
              </Link>
            </nav>

            {/* Sign Out */}
            <div className="pt-2 border-t">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-3 px-2 py-3 text-red-600 hover:bg-red-50 rounded-md w-full"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
