import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CatalogResults, { CatalogResultsSkeleton } from '@/components/libreria/CatalogResults';
import { getCategorias } from '@/lib/api';

// Ruta dinámica: se prerenderiza una página por cada categoría que devuelve la API.
export async function generateStaticParams() {
  const categorias = await getCategorias();
  return categorias.map((categoria) => ({ categoria: categoria.slug }));
}

export async function generateMetadata({ params }) {
  const { categoria } = await params;
  const datos = (await getCategorias()).find((c) => c.slug === categoria);
  return { title: datos ? datos.nombre : 'Categoría' };
}

async function Cabecera({ params }) {
  const { categoria } = await params;
  const datos = (await getCategorias()).find((c) => c.slug === categoria);
  if (!datos) notFound();

  return (
    <header className="mb-4">
      <p className="eyebrow">{datos.tipo === 'revista' ? 'Revistas' : 'Libros'}</p>
      <h1 className="mt-2 text-4xl font-semibold">{datos.nombre}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{datos.descripcion}</p>
    </header>
  );
}

export default function CategoriaPage({ params, searchParams }) {
  return (
    <>
      <Suspense fallback={<div className="mb-6 h-24 animate-pulse rounded-2xl bg-paper-deep" />}>
        <Cabecera params={params} />
      </Suspense>
      <Suspense fallback={<CatalogResultsSkeleton />}>
        <CatalogResults searchParams={searchParams} categoria={params.then((p) => p.categoria)} />
      </Suspense>
    </>
  );
}
