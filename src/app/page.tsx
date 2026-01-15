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
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">ScopeShield AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Detect Scope Creep.
            <span className="text-primary block mt-2">Protect Your Projects.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ScopeShield AI analyzes client messages to detect scope creep before it happens.
            Get professional reply suggestions that protect your time and maintain relationships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Analysis</h3>
            <p className="text-muted-foreground">
              Paste any client message and get instant scope creep risk assessment with detailed reasoning.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Reply Suggestions</h3>
            <p className="text-muted-foreground">
              Get professional, relationship-safe reply templates to address scope creep diplomatically.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Project Context</h3>
            <p className="text-muted-foreground">
              Define your project scope once, and every analysis is tailored to your specific agreement.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Set Up Your Project</h3>
                <p className="text-muted-foreground">
                  Create a project and define your scope. Add bullet points of what&apos;s included,
                  what&apos;s excluded, and optionally upload your contract PDF.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Paste Client Messages</h3>
                <p className="text-muted-foreground">
                  When you receive a client request that feels like it might be scope creep,
                  paste it into ScopeShield for analysis.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Get Insights & Replies</h3>
                <p className="text-muted-foreground">
                  Receive a risk assessment, detailed reasoning, and three professional reply options
                  you can copy and customize.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center bg-primary rounded-2xl p-12 max-w-4xl mx-auto text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to protect your projects?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join freelancers and agencies who use ScopeShield AI to maintain healthy
            client relationships while protecting their time and revenue.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">ScopeShield AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Risk assessment tool for communication. Not legal advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
