'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SupportWidget } from './SupportWidget';

const AUTH_PATHS = ['/auth/', '/admin'];

export function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDedicatedLayout = AUTH_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      {!isDedicatedLayout && <Navbar />}
      <main>{children}</main>
      {!isDedicatedLayout && <Footer />}
      {!isDedicatedLayout && <SupportWidget />}
    </>
  );
}
