// pages/privacy-policy.tsx
export default function PrivacyPolicy() {
  return (
    <div className="w-full bg-background">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-90">
            Welcome to Scriptorium! We are committed to protecting your privacy and ensuring
            the security of your personal information.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl shadow-md p-8 text-card-foreground">
            {/* Introduction */}
            <div className="text-center mb-12">
              <p className="text-muted-foreground">
                This Privacy Policy outlines how we collect,
                use, and safeguard your data.
              </p>
            </div>

            {/* Information Collection */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground">
                We may collect personal information such as your name, email address, and activity on
                the platform to improve your experience and provide better services.
              </p>
            </section>

            {/* Information Usage */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground">
                Your information is used solely for enhancing your experience on our platform. We do not
                share or sell your data to third parties.
              </p>
            </section>

            {/* Contact Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a 
                  href="mailto:support@scriptorium.com" 
                  className="text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  support@scriptorium.com
                </a>.
              </p>
            </section>

            {/* Last Updated */}
            <div className="text-center mt-8">
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