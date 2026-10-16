'use client';

// Client Component: grupos desplegables (Libros / Revistas) con estado propio,
// y usePathname() para resaltar la categoría activa. Las categorías llegan como props
// desde el layout, que es un Server Component y las obtiene de la API.
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const grupos = [
  { tipo: 'libro', titulo: 'Libros' },
  { tipo: 'revista', titulo: 'Revistas' },
];

export default function CategoryMenu({ categorias, conteo }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [abiertos, setAbiertos] = useState({ libro: true, revista: true });
  // Al cambiar de categoría se conservan los filtros activos
  const query = searchParams.size ? `?${searchParams}` : '';

  const enlace = (href, etiqueta, total) => {
    const activo = pathname === href;
    return (
      <Link
        href={`${href}${query}`}
        aria-current={activo ? 'page' : undefined}
        className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
          activo ? 'bg-forest font-semibold text-paper' : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
        }`}
      >
        {etiqueta}
        <span className={`text-xs ${activo ? 'text-paper/80' : 'text-ink-soft/70'}`}>{total}</span>
      </Link>
    );
  };

  return (
    <nav aria-label="Categorías" className="space-y-3">
      <p className="label">Categorías</p>
      {enlace('/libreria/catalogo', 'Todo el catálogo', conteo.todos)}
      {grupos.map(({ tipo, titulo }) => (
        <div key={tipo}>
          <button
            type="button"
            onClick={() => setAbiertos((actual) => ({ ...actual, [tipo]: !actual[tipo] }))}
            aria-expanded={abiertos[tipo]}
            className="flex w-full items-center justify-between px-3 py-1.5 text-sm font-semibold"
          >
            {titulo}
            <svg
              viewBox="0 0 24 24"
              className={`size-4 transition-transform ${abiertos[tipo] ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {abiertos[tipo] && (
            <ul className="mt-1 space-y-0.5 border-l border-line pl-2">
              {categorias
                .filter((categoria) => categoria.tipo === tipo)
                .map((categoria) => (
                  <li key={categoria.slug}>
                    {enlace(`/libreria/catalogo/${categoria.slug}`, categoria.nombre, conteo[categoria.slug] ?? 0)}
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}
