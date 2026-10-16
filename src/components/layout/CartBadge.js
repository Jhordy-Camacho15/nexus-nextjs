'use client';

// Client Component: lee el carrito del contexto (estado del navegador).
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartBadge() {
  const { totalUnidades } = useCart();

  return (
    <Link
      href="/libreria/carrito"
      className="relative inline-flex size-10 items-center justify-center rounded-full border border-line bg-card text-ink hover:border-ink"
    >
      <span className="sr-only">Carrito ({totalUnidades} productos)</span>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 7h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 7Z" />
        <path d="M9 10V6a3 3 0 0 1 6 0v4" />
      </svg>
      {totalUnidades > 0 && (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-accent px-1.5 text-center text-[11px] font-bold leading-5 text-white">
          {totalUnidades}
        </span>
      )}
    </Link>
  );
}
