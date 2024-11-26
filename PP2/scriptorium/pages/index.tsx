import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-gray-100 shadow-md">
        <div className="flex items-center gap-4">
          <Image src="/logo.svg" alt="Scriptorium Logo" width={40} height={40} />
          <span className="text-xl font-bold">Scriptorium</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/templates" className="hover:underline">
            Templates
          </Link>
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <div className="relative group">
            <button className="flex items-center gap-2">
              Profile
              <Image src="/icons/user.svg" alt="User Icon" width={16} height={16} />
            </button>
            <div className="absolute right-0 mt-2 hidden w-40 bg-white border border-gray-200 shadow-md group-hover:block">
              <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                My Profile
              </Link>
              <Link href="/logout" className="block px-4 py-2 hover:bg-gray-100">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white py-20">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6">Scriptorium</h1>
        <p className="text-lg sm:text-xl max-w-3xl">
          The new way to write, execute, and share code seamlessly. Explore templates, read blogs, and create amazing projects with ease.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/editor"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg shadow-md hover:bg-gray-200"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="bg-transparent border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600"
          >
            Learn More
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <Image src="/icons/languages.svg" alt="Multi-language Support" width={60} height={60} />
            <h3 className="text-xl font-semibold mt-4">Multi-language Support</h3>
            <p className="text-gray-600">
              Execute code in 15+ languages with ease, all within a secure sandbox environment.
            </p>
          </div>
          <div className="text-center">
            <Image src="/icons/security.svg" alt="Secure Code Execution" width={60} height={60} />
            <h3 className="text-xl font-semibold mt-4">Secure Code Execution</h3>
            <p className="text-gray-600">
              Your code runs in isolation, ensuring safety and reliability at every step.
            </p>
          </div>
          <div className="text-center">
            <Image src="/icons/templates.svg" alt="Ready-to-Use Templates" width={60} height={60} />
            <h3 className="text-xl font-semibold mt-4">Ready-to-Use Templates</h3>
            <p className="text-gray-600">
              Get started faster with 30+ pre-built templates for various programming tasks.
            </p>
          </div>
        </div>
      </section>

      {/* Templates and Blog Highlights */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Explore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Top Templates</h3>
            <p className="text-gray-600">Discover the most popular templates used by our community.</p>
            <Link
              href="/templates"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              Browse Templates →
            </Link>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Top Blog Posts</h3>
            <p className="text-gray-600">Read insightful articles from developers and educators.</p>
            <Link
              href="/blog"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              Browse Blogs →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="max-w-5xl mx-auto text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Scriptorium. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}