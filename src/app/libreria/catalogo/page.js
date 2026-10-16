import { Suspense } from 'react';
import CatalogResults, { CatalogResultsSkeleton } from '@/components/libreria/CatalogResults';

export const metadata = { title: 'Catálogo' };

// La cabecera es estática; los resultados dependen de los filtros de la URL y se transmiten en streaming.
export default function CatalogoPage({ searchParams }) {
  return (
    <>
      <header className="mb-4">
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-2 text-4xl font-semibold">Todos los libros y revistas</h1>
      </header>
      <Suspense fallback={<CatalogResultsSkeleton />}>
        <CatalogResults searchParams={searchParams} />
      </Suspense>
    </>
  );
}
