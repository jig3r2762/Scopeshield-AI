import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Privacy Policy | ScopeShield AI',
  description: 'Privacy Policy for ScopeShield AI and Chrome Extension',
}

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-gray-500 mb-8">Last updated: January 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  ScopeShield AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, and safeguard your information when you use
                  our web application and Chrome browser extension.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>

                <h3 className="text-lg font-medium mt-4 mb-2">2.1 Account Information</h3>
                <p className="text-gray-600 leading-relaxed">
                  When you create an account, we collect your email address and name for authentication purposes.
                </p>

                <h3 className="text-lg font-medium mt-4 mb-2">2.2 Project Data</h3>
                <p className="text-gray-600 leading-relaxed">
                  You may provide project scope information, including project descriptions, included items,
                  excluded items, and contract details. This data is stored securely and used solely to
                  provide scope creep analysis.
                </p>

                <h3 className="text-lg font-medium mt-4 mb-2">2.3 Message Content</h3>
                <p className="text-gray-600 leading-relaxed">
                  When you use our analysis feature, you submit client message content for scope creep detection.
                  This content is processed by our AI system and stored as part of your analysis history.
                </p>

                <h3 className="text-lg font-medium mt-4 mb-2">2.4 Chrome Extension Data</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our Chrome extension accesses email content on Gmail and Outlook only when you explicitly
                  click the &quot;Analyze&quot; button. We do not automatically read, scan, or store your emails.
                  The extension only processes the specific email content you choose to analyze.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>To provide scope creep analysis and reply suggestions</li>
                  <li>To maintain your project history and analysis records</li>
                  <li>To authenticate your account and provide access to our services</li>
                  <li>To improve our AI analysis capabilities</li>
                  <li>To send important service-related communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your data is stored securely using industry-standard encryption. We use secure HTTPS
                  connections for all data transmission. Your API tokens are encrypted and can be revoked
                  at any time from your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Chrome Extension Permissions</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Our Chrome extension requests the following permissions:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li><strong>storage:</strong> To save your API token and preferences locally in your browser</li>
                  <li><strong>activeTab:</strong> To read email content only when you click the analyze button</li>
                  <li><strong>sidePanel:</strong> To display analysis results in a convenient side panel</li>
                  <li><strong>Host permissions for Gmail/Outlook:</strong> To inject the analyze button into email interfaces</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Data Sharing</h2>
                <p className="text-gray-600 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties.
                  Your message content and project data are never shared with other users or external services,
                  except for AI processing to provide our core analysis functionality.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your account data and analysis history are retained as long as your account is active.
                  You can delete your analysis history at any time. Upon account deletion, all associated
                  data will be permanently removed within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                  <li>Revoke API tokens at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use essential cookies for authentication and session management. We do not use
                  tracking cookies or share cookie data with third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Children&apos;s Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly
                  collect personal information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes
                  by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                  <br />
                  <a href="mailto:privacy@scopeshield.ai" className="text-primary hover:underline">
                    privacy@scopeshield.ai
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
