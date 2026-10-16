import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import AddToCartButton from '@/components/libreria/AddToCartButton';
import BookCard from '@/components/libreria/BookCard';
import BookCover from '@/components/libreria/BookCover';
import { getCatalogo, getCategorias, getItem } from '@/lib/api';
import { formatPrecio } from '@/lib/format';

// Generación estática (SSG): en el build se crea una página por cada libro o revista del catálogo.
export async function generateStaticParams() {
  const catalogo = await getCatalogo();
  return catalogo.map((item) => ({ id: String(item.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getItem(id);
  return item ? { title: item.titulo, description: item.descripcion } : { title: 'No encontrado' };
}

async function Detalle({ params }) {
  const { id } = await params;
  const [item, categorias, catalogo] = await Promise.all([getItem(id), getCategorias(), getCatalogo()]);
  if (!item) notFound();

  const categoria = categorias.find((c) => c.slug === item.categoria);
  const relacionados = catalogo.filter((otro) => otro.categoria === item.categoria && otro.id !== item.id).slice(0, 5);
  const ficha = [
    ['Autor', item.autor],
    ['Editorial', item.editorial],
    ['Año', item.anio],
    ['Páginas', item.paginas],
    ['Idioma', item.idioma],
    item.isbn ? ['ISBN', item.isbn] : ['ISSN', item.issn],
    ...(item.numero ? [['Número', item.numero]] : []),
    ['Valoración', `${item.valoracion.toFixed(1)} / 5`],
  ];

  return (
    <>
      <nav aria-label="Ruta de navegación" className="text-sm text-ink-soft">
        <Link href="/libreria/catalogo" className="hover:text-ink">
          Catálogo
        </Link>
        {' / '}
        <Link href={`/libreria/catalogo/${item.categoria}`} className="hover:text-ink">
          {categoria?.nombre}
        </Link>
        {' / '}
        <span className="text-ink">{item.titulo}</span>
      </nav>

      <article className="mt-8 grid gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
        <BookCover item={item} sizes="(min-width: 768px) 320px, 80vw" eager className="mx-auto w-full max-w-xs md:max-w-none" />

        <div>
          <p className="eyebrow">{item.tipo === 'revista' ? 'Revista' : 'Libro'} · {categoria?.nombre}</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{item.titulo}</h1>
          <p className="mt-3 text-lg text-ink-soft">{item.autor}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="font-display text-3xl font-semibold">{formatPrecio(item.precio)}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.stock > 0 ? 'bg-free-soft text-free' : 'bg-busy-soft text-busy'
              }`}
            >
              {item.stock > 0 ? `${item.stock} unidades disponibles` : 'Agotado'}
            </span>
            <span className="text-sm text-ink-soft">{item.ventasUltimasSemanas} vendidos en las últimas semanas</span>
          </div>

          <div className="mt-6">
            <AddToCartButton item={item} />
          </div>

          <p className="mt-8 max-w-prose leading-relaxed">{item.descripcion}</p>

          <dl className="mt-8 grid max-w-xl grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-line pt-6 text-sm">
            {ficha.map(([clave, valor]) => (
              <div key={clave} className="contents">
                <dt className="text-ink-soft">{clave}</dt>
                <dd className="font-medium">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-semibold">Más en {categoria?.nombre}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {relacionados.map((otro) => (
              <li key={otro.id}>
                <BookCard item={otro} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function LibroPage({ params }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-2xl bg-paper-deep" />}>
        <Detalle params={params} />
      </Suspense>
    </div>
  );
}
