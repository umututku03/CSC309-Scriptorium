// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-5xl mx-auto py-8 px-6 text-center">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} Scriptorium. All rights reserved.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Link 
            href="/privacy-policy" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/terms" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}