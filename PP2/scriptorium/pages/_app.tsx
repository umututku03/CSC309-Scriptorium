// pages/_app.tsx
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
    >
      <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Navbar />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}