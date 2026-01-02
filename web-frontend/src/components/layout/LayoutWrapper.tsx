'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import ChatBot from './ChatBot';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/register') || 
                     pathname?.startsWith('/forgot-password') ||
                     pathname?.startsWith('/reset-password') ||
                     pathname?.startsWith('/verify-email');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen" suppressHydrationWarning>
        {children}
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}
