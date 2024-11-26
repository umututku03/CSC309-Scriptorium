// pages/terms/index.tsx
export default function TermsOfService() {
  return (
    <div className="w-full bg-background">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-90">
            Welcome to Scriptorium! By using our platform, you agree to the following terms and
            conditions. Please read them carefully.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl shadow-md p-8 space-y-12 text-card-foreground">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using Scriptorium, you agree to comply with these Terms of Service and
                all applicable laws and regulations. If you do not agree with any part of these terms,
                you must discontinue using our platform.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Conduct</h2>
              <p className="text-muted-foreground">
                You agree not to misuse the platform in any way, including but not limited to submitting
                malicious code, violating intellectual property rights, or engaging in unlawful
                activities.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Content Ownership</h2>
              <p className="text-muted-foreground">
                All templates, code, and blog posts shared on Scriptorium remain the intellectual
                property of their respective owners. By sharing content, you grant us a non-exclusive
                license to display and distribute it on the platform.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Scriptorium is provided "as is" without any warranties, expressed or implied. We are not
                responsible for any damages resulting from the use of our platform.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be communicated via
                email or a notification on the platform.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a 
                  href="mailto:support@scriptorium.com" 
                  className="text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  support@scriptorium.com
                </a>
              </p>
            </section>

            {/* Last Updated */}
            <div className="text-center pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}