// Server Component: estructura estática de la cabecera. Solo las piezas interactivas
// (MainNav, CartBadge) son Client Components y la parte del usuario se transmite con Suspense.
import Link from 'next/link';
import { Suspense } from 'react';
import CartBadge from './CartBadge';
import MainNav from './MainNav';
import UserMenu from './UserMenu';
import Logo from './Logo';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Nexus, ir al inicio">
          <Logo />
        </Link>
        <MainNav />
        <div className="ml-auto mr-12 flex items-center gap-2 md:mr-0">
          <CartBadge />
          <Suspense fallback={<span className="block h-10 w-28 animate-pulse rounded-full bg-paper-deep" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
