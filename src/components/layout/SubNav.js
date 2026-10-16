'use client';

// Client Component: usa usePathname() para marcar la pestaña activa de cada sección.
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SubNav({ titulo, enlaces }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-line bg-card/60">
      <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4">
        <p className="shrink-0 py-3 font-display text-lg font-semibold">{titulo}</p>
        <nav aria-label={titulo}>
          <ul className="flex gap-1">
            {enlaces.map(({ href, etiqueta, exacto }) => {
              const activo = exacto ? pathname === href : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={activo ? 'page' : undefined}
                    className={`block whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                      activo ? 'border-accent text-ink' : 'border-transparent text-ink-soft hover:text-ink'
                    }`}
                  >
                    {etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
