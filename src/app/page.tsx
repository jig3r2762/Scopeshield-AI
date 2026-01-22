import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Shield,
  MessageSquare,
  Zap,
  CheckCircle,
  Chrome,
  Mail,
  ArrowRight,
  AlertTriangle,
  DollarSign,
  Clock,
  Star,
  Quote
} from 'lucide-react'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <header className="w-full px-4 py-4 md:py-6 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
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
              <Button size="sm" className="text-sm">Get Started Free</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="w-full">
        {/* Hero Section */}
        <section className="px-4 py-12 md:py-20 lg:py-28">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Chrome className="h-4 w-4" />
                Free Chrome Extension Available
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Stop Losing Money to
                <span className="text-primary block">&quot;Quick Changes&quot;</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                AI-powered scope creep detection for freelancers. Analyze client emails instantly and get professional replies that protect your boundaries.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 text-lg">
                    Start Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a
                  href="https://chromewebstore.google.com/search/ScopeShield%20AI"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 text-lg">
                    <Chrome className="mr-2 h-5 w-5" />
                    Add to Chrome
                  </Button>
                </a>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>100% Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Works with Gmail & Outlook</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="px-4 py-16 md:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Sound Familiar?</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Every freelancer has been there. These &quot;small requests&quot; add up fast.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white rounded-xl p-6 md:p-8 border border-red-100 shadow-sm">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">&quot;Just one more thing...&quot;</h3>
                <p className="text-gray-600">
                  Client keeps adding &quot;small&quot; requests that weren&apos;t in the original scope. Each one takes hours.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 border border-orange-100 shadow-sm">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">&quot;This should be quick&quot;</h3>
                <p className="text-gray-600">
                  You end up working for free because you don&apos;t know how to push back without damaging the relationship.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 border border-yellow-100 shadow-sm">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">&quot;Before we launch...&quot;</h3>
                <p className="text-gray-600">
                  Last-minute changes that completely change the project scope, leaving you stressed and underpaid.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                Freelancers lose $10,000+ per year to scope creep
              </p>
              <p className="text-gray-500 mt-2">It&apos;s time to protect your time and income.</p>
            </div>
          </div>
        </section>

        {/* How It Works - Visual */}
        <section className="px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Protect yourself in 3 simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <h3 className="font-semibold text-xl mb-3">Install Extension</h3>
                <p className="text-gray-600">
                  Add ScopeShield to Chrome. It works seamlessly with Gmail and Outlook.
                </p>
              </div>

              <div className="text-center">
                <div className="relative mb-6">
                  <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <h3 className="font-semibold text-xl mb-3">Click &quot;Check Scope&quot;</h3>
                <p className="text-gray-600">
                  When you get a suspicious client email, click the button. AI analyzes it instantly.
                </p>
              </div>

              <div className="text-center">
                <div className="relative mb-6">
                  <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                    3
                  </div>
                </div>
                <h3 className="font-semibold text-xl mb-3">Get Smart Replies</h3>
                <p className="text-gray-600">
                  Receive risk assessment + 3 professional responses you can copy and send.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 md:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Powerful features to protect your freelance business
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Gmail & Outlook</h3>
                <p className="text-gray-600 text-sm">
                  Works directly in your inbox. No copy-pasting needed.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instant Analysis</h3>
                <p className="text-gray-600 text-sm">
                  AI-powered detection in under 3 seconds. Know immediately if it&apos;s scope creep.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Replies</h3>
                <p className="text-gray-600 text-sm">
                  3 professional response options: Polite Boundary, Paid Add-on, or Negotiation.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Project Scope Tracking</h3>
                <p className="text-gray-600 text-sm">
                  Define your project scope once. All analyses are context-aware.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Risk Scoring</h3>
                <p className="text-gray-600 text-sm">
                  Track client risk over time. Identify problematic clients early.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Message History</h3>
                <p className="text-gray-600 text-sm">
                  Keep records of all analyzed messages. Perfect for documentation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials Placeholder */}
        <section className="px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Freelancers</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-gray-200 mb-4" />
                <p className="text-gray-600 mb-6">
                  &quot;Finally, a tool that helps me say no professionally. I&apos;ve saved at least 10 hours this month from scope creep requests.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">SK</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Sarah K.</p>
                    <p className="text-gray-500 text-xs">Web Developer</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-gray-200 mb-4" />
                <p className="text-gray-600 mb-6">
                  &quot;The Chrome extension is a game-changer. I check every client email now before responding. Worth every penny.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">MR</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Mike R.</p>
                    <p className="text-gray-500 text-xs">UI/UX Designer</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-gray-200 mb-4" />
                <p className="text-gray-600 mb-6">
                  &quot;I used to feel guilty pushing back on clients. Now I have the confidence and the words to protect my boundaries.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">JL</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Jessica L.</p>
                    <p className="text-gray-500 text-xs">Marketing Consultant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 py-16 md:py-24 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">Is ScopeShield AI really free?</h3>
                <p className="text-gray-600">
                  Yes! ScopeShield AI is completely free to use. We believe every freelancer deserves protection from scope creep.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">How does it work with my emails?</h3>
                <p className="text-gray-600">
                  The Chrome extension adds a &quot;Check Scope&quot; button to Gmail and Outlook. When you click it, the email content is analyzed by our AI. We never store your emails permanently.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">Do I need to define my project scope?</h3>
                <p className="text-gray-600">
                  Not required! You can analyze any email without a project. But adding your project scope makes the analysis much more accurate and contextual.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">Is my data secure?</h3>
                <p className="text-gray-600">
                  Absolutely. We use encrypted connections, and your API tokens are securely hashed. We don&apos;t sell your data or share it with third parties.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">What types of freelancers use this?</h3>
                <p className="text-gray-600">
                  Web developers, designers, copywriters, marketers, consultants, and agencies of all sizes. Anyone who works with clients on project-based work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl md:rounded-3xl p-8 md:p-16 text-white text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Stop Scope Creep Today
              </h2>
              <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of freelancers who protect their time and income with ScopeShield AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8 py-6 text-lg">
                    Create Free Account
                  </Button>
                </Link>
                <a
                  href="https://chromewebstore.google.com/search/ScopeShield%20AI"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 text-lg bg-white/10 border-white/30 hover:bg-white/20 text-white">
                    <Chrome className="mr-2 h-5 w-5" />
                    Get Chrome Extension
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-8 md:py-12 border-t bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">ScopeShield AI</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <a
                href="mailto:support@scopeshield.ai"
                className="hover:text-primary transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} ScopeShield AI. All rights reserved.</p>
            <p className="mt-2">Risk assessment tool for communication. Not legal advice.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
