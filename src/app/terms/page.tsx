import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Terms of Service | ScopeShield AI',
  description: 'Terms of Service for ScopeShield AI',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <header className="w-full px-4 py-4 md:py-6">
        <nav className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="font-bold text-lg md:text-xl">ScopeShield AI</span>
          </Link>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="w-full px-4 pb-16">
        <div className="max-w-4xl mx-auto py-8 md:py-12">
          <div className="bg-white rounded-xl p-6 md:p-10 shadow-sm border">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-gray-500 mb-8">Last updated: March 2026</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using ScopeShield AI (&quot;the Service&quot;), you agree to be bound by these
                  Terms of Service. If you do not agree to these terms, please do not use the Service.
                  These terms apply to all users of the web application and Chrome browser extension.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  ScopeShield AI is a scope creep detection tool that helps freelancers and contractors
                  identify and manage out-of-scope client requests. The Service includes a web application
                  and Chrome browser extension that analyzes client messages for potential scope creep
                  using AI and pattern-based analysis.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <h3 className="text-lg font-medium mt-4 mb-2">3.1 Account Creation</h3>
                <p className="text-gray-600 leading-relaxed">
                  You must provide accurate and complete information when creating an account. You are
                  responsible for maintaining the confidentiality of your account credentials and for
                  all activity that occurs under your account.
                </p>
                <h3 className="text-lg font-medium mt-4 mb-2">3.2 Account Termination</h3>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these Terms of
                  Service, engage in fraudulent activity, or otherwise misuse the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
                <p className="text-gray-600 leading-relaxed mb-3">You agree not to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Use the Service for any unlawful purpose or in violation of any regulations</li>
                  <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts</li>
                  <li>Upload malicious code, viruses, or any software that could damage the Service</li>
                  <li>Use the Service to harass, threaten, or harm others</li>
                  <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                  <li>Resell or redistribute the Service without written permission</li>
                  <li>Use automated tools to scrape or extract data from the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Subscription and Billing</h2>
                <h3 className="text-lg font-medium mt-4 mb-2">5.1 Free and Paid Plans</h3>
                <p className="text-gray-600 leading-relaxed">
                  ScopeShield AI may offer both free and paid subscription plans. Features available
                  under each plan are described on our pricing page and may change over time with notice.
                </p>
                <h3 className="text-lg font-medium mt-4 mb-2">5.2 Refunds</h3>
                <p className="text-gray-600 leading-relaxed">
                  Paid subscriptions are non-refundable except where required by applicable law. If you
                  believe a charge is incorrect, please contact us within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  The Service, including all software, designs, text, and graphics, is owned by
                  ScopeShield AI and protected by intellectual property laws. You retain ownership
                  of the content you submit (project data, messages) but grant us a limited license
                  to process it solely to provide the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. AI Analysis Disclaimer</h2>
                <p className="text-gray-600 leading-relaxed">
                  The analysis provided by ScopeShield AI is for informational purposes only and is
                  not legal advice. AI-generated assessments may not be 100% accurate. You should
                  always exercise your own professional judgment when responding to client requests
                  and consult a legal professional for complex contract disputes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, ScopeShield AI shall not be liable for any
                  indirect, incidental, special, consequential, or punitive damages, including loss of
                  profits, data, or business opportunities, arising from your use of or inability to
                  use the Service, even if we have been advised of the possibility of such damages.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
                <p className="text-gray-600 leading-relaxed">
                  The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
                  either express or implied, including but not limited to implied warranties of
                  merchantability, fitness for a particular purpose, or non-infringement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your use of the Service is also governed by our{' '}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>,
                  which is incorporated into these Terms of Service by reference.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update these Terms of Service from time to time. We will notify you of
                  significant changes by posting the updated terms on this page and updating the
                  &quot;Last updated&quot; date. Continued use of the Service after changes constitutes
                  acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms of Service shall be governed by and construed in accordance with
                  applicable laws. Any disputes arising under these terms shall be resolved through
                  binding arbitration or in courts of competent jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                  <br />
                  <a href="mailto:support@scopeshield.ai" className="text-primary hover:underline">
                    support@scopeshield.ai
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-6 md:py-8 border-t">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">ScopeShield AI</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
