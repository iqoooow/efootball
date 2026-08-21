'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SupportWidget } from './SupportWidget';

const AUTH_PATHS = ['/auth/'];

export function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      {!isAuth && <Navbar />}
      <main>{children}</main>
      {!isAuth && <Footer />}
      {!isAuth && <SupportWidget />}
    </>
  );
}
