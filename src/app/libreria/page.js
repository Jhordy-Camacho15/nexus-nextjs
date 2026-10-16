import Link from 'next/link';
import BookGrid from '@/components/libreria/BookGrid';
import { getCatalogo, getCategorias, getMasVendidos } from '@/lib/api';

export const metadata = { title: 'Librería · Los más vendidos' };

// Server Component sin datos de la petición: todo viene de funciones cacheadas ('use cache'),
// así que la página se genera en el build y se regenera cada hora (cacheLife('hours') en getCatalogo).
export default async function LibreriaPage() {
  const [masVendidos, categorias, catalogo] = await Promise.all([getMasVendidos(10), getCategorias(), getCatalogo()]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-12">
        <p className="eyebrow">Ranking semanal</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
          Los 10 más vendidos de las últimas semanas
        </h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Lo que más se está leyendo en el campus. Pasa el ratón por una portada para ver su ficha rápida o haz clic
          para abrirla.
        </p>
      </section>

      <BookGrid items={masVendidos} numerado />

      <section className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Explora</p>
            <h2 className="mt-2 text-3xl font-semibold">Categorías de libros y revistas</h2>
          </div>
          <Link href="/libreria/catalogo" className="btn-ghost">
            Ver todo el catálogo ({catalogo.length})
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categorias.map((categoria) => (
            <li key={categoria.slug}>
              <Link
                href={`/libreria/catalogo/${categoria.slug}`}
                className="card flex h-full flex-col p-4 transition-colors hover:border-forest hover:bg-forest-soft"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                  {categoria.tipo === 'revista' ? 'Revistas' : 'Libros'}
                </span>
                <span className="mt-1 font-display text-lg font-semibold">{categoria.nombre}</span>
                <span className="mt-2 text-sm text-ink-soft">{categoria.descripcion}</span>
                <span className="mt-auto pt-3 text-xs font-semibold text-forest">
                  {catalogo.filter((item) => item.categoria === categoria.slug).length} títulos →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
