// components/Navbar.tsx
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-background border-b border-secondary dark:border-secondary/10 z-50">
        <div className="h-16 flex items-center justify-between px-6">
          {/* Logo and Branding */}
          <div className="flex items-center gap-4">
            <Image
              src="/logo.jpg"
              alt="Scriptorium Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="text-2xl font-bold text-foreground">
              Scriptorium
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-secondary-text hover:text-foreground transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/templates"
              className="text-secondary-text hover:text-foreground transition-colors duration-200"
            >
              Templates
            </Link>
            <Link
              href="/blogposts"
              className="text-secondary-text hover:text-foreground transition-colors duration-200"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-secondary-text hover:text-foreground transition-colors duration-200"
            >
              About Us
            </Link>

            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                className="flex items-center gap-2 text-secondary-text hover:text-foreground transition-colors duration-200"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                Profile
                <Image
                  src="/icons/user.png"
                  alt="User Icon"
                  width={16}
                  height={16}
                />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background border border-secondary dark:border-secondary/10 rounded-md shadow-lg">
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-secondary-text hover:bg-secondary/50 hover:text-foreground rounded-t-md transition-colors duration-200"
                    onClick={() => setProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-secondary-text hover:bg-secondary/50 hover:text-foreground transition-colors duration-200"
                    onClick={() => setProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link 
                    href="/logout" 
                    className="block px-4 py-2 text-red-600 dark:text-red-400 hover:bg-secondary/50 rounded-b-md transition-colors duration-200"
                    onClick={() => setProfileOpen(false)}
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <Image
                src="/icons/menu.png"
                alt="Menu Icon"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-t border-secondary dark:border-secondary/10 md:hidden">
            <div className="flex flex-col">
              <Link
                href="/"
                className="px-6 py-4 text-secondary-text hover:bg-secondary/50 hover:text-foreground transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/templates"
                className="px-6 py-4 text-secondary-text hover:bg-secondary/50 hover:text-foreground transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Templates
              </Link>
              <Link
                href="/blog"
                className="px-6 py-4 text-secondary-text hover:bg-secondary/50 hover:text-foreground transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="px-6 py-4 text-secondary-text hover:bg-secondary/50 hover:text-foreground transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/profile"
                className="px-6 py-4 text-secondary-text hover:bg-secondary/50 hover:text-foreground transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="px-6 py-4 text-secondary-text hover:bg-secondary/50 hover:text-foreground transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <Link
                href="/logout"
                className="px-6 py-4 text-red-600 dark:text-red-400 hover:bg-secondary/50 transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Logout
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer div to prevent content from going under the navbar */}
      <div className="h-16" />
    </>
  );
}