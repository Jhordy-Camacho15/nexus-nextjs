'use client';

// Client Component: necesita usePathname() para resaltar la sección activa
// y useState para abrir/cerrar el menú en móvil.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const enlaces = [
  { href: '/', etiqueta: 'Inicio' },
  { href: '/libreria', etiqueta: 'Librería' },
  { href: '/coworking', etiqueta: 'Coworking' },
];

export default function MainNav() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const activo = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav aria-label="Principal" className="order-last w-full md:order-none md:w-auto">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-controls="menu-principal"
        className="absolute right-4 top-3 inline-flex size-10 items-center justify-center rounded-full border border-line bg-card md:hidden"
      >
        <span className="sr-only">{abierto ? 'Cerrar menú' : 'Abrir menú'}</span>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {abierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <ul
        id="menu-principal"
        className={`${abierto ? 'flex' : 'hidden'} flex-col gap-1 pt-3 md:flex md:flex-row md:items-center md:pt-0`}
      >
        {enlaces.map(({ href, etiqueta }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setAbierto(false)}
              aria-current={activo(href) ? 'page' : undefined}
              className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activo(href) ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
              }`}
            >
              {etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
