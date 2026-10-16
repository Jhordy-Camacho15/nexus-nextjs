// Server Component: lee los searchParams de la URL (dato de la petición), filtra el catálogo
// cacheado y devuelve el HTML ya renderizado. Va siempre dentro de <Suspense>.
import { getCatalogo } from '@/lib/api';
import { filtrarCatalogo, leerFiltros } from '@/lib/catalogo';
import BookGrid from './BookGrid';

// `categoria` puede llegar como promesa (params de la ruta dinámica) para resolverse dentro de Suspense
export default async function CatalogResults({ searchParams, categoria }) {
  const [filtros, catalogo, slug] = await Promise.all([searchParams.then(leerFiltros), getCatalogo(), categoria]);
  const base = slug ? catalogo.filter((item) => item.categoria === slug) : catalogo;
  const items = filtrarCatalogo(base, filtros);

  return (
    <>
      <p className="mb-6 text-sm text-ink-soft" aria-live="polite">
        {items.length === 1 ? '1 resultado' : `${items.length} resultados`}
        {filtros.q && (
          <>
            {' '}
            para «<span className="font-semibold text-ink">{filtros.q}</span>»
          </>
        )}
      </p>
      <BookGrid items={items} />
    </>
  );
}

export function CatalogResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i}>
          <div className="aspect-[2/3] animate-pulse rounded-lg bg-paper-deep" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-paper-deep" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-paper-deep" />
        </div>
      ))}
    </div>
  );
}
