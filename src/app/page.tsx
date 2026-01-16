import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Shield, MessageSquare, Zap, CheckCircle } from 'lucide-react'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <header className="w-full px-4 py-4 md:py-6">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="font-bold text-lg md:text-xl">ScopeShield AI</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-sm">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="w-full px-4">
        <div className="max-w-6xl mx-auto py-8 md:py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Detect Scope Creep.
              <span className="text-primary block mt-2">Protect Your Projects.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              ScopeShield AI analyzes client messages to detect scope creep before it happens.
              Get professional reply suggestions that protect your time and maintain relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-16 md:mt-24 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-base md:text-lg mb-2">Smart Analysis</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Paste any client message and get instant scope creep risk assessment with detailed reasoning.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-base md:text-lg mb-2">Reply Suggestions</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Get professional, relationship-safe reply templates to address scope creep diplomatically.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border sm:col-span-2 lg:col-span-1">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-base md:text-lg mb-2">Project Context</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Define your project scope once, and every analysis is tailored to your specific agreement.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-16 md:mt-24 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">How It Works</h2>
            <div className="space-y-6 md:space-y-8">
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="h-8 w-8 md:h-10 md:w-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0 text-sm md:text-base">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-1">Set Up Your Project</h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Create a project and define your scope. Add bullet points of what&apos;s included,
                    what&apos;s excluded, and optionally upload your contract PDF.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 md:gap-6 items-start">
                <div className="h-8 w-8 md:h-10 md:w-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0 text-sm md:text-base">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-1">Paste Client Messages</h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    When you receive a client request that feels like it might be scope creep,
                    paste it into ScopeShield for analysis.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 md:gap-6 items-start">
                <div className="h-8 w-8 md:h-10 md:w-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0 text-sm md:text-base">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-1">Get Insights & Replies</h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Receive a risk assessment, detailed reasoning, and three professional reply options
                    you can copy and customize.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 md:mt-24 text-center bg-primary rounded-xl md:rounded-2xl p-8 md:p-12 max-w-4xl mx-auto text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to protect your projects?</h2>
            <p className="text-white/80 mb-6 md:mb-8 max-w-xl mx-auto text-sm md:text-base">
              Join freelancers and agencies who use ScopeShield AI to maintain healthy
              client relationships while protecting their time and revenue.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-base">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-6 md:py-8 mt-8 md:mt-16 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">ScopeShield AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary">
              Privacy Policy
            </Link>
            <p className="text-sm text-gray-500 text-center md:text-left">
              Risk assessment tool for communication. Not legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
