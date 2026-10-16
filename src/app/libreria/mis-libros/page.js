import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import BookCover from '@/components/libreria/BookCover';
import { getCatalogo, getHistorialCompras } from '@/lib/api';
import { formatFecha, formatPrecio } from '@/lib/format';
import { getComprasSesion, getSession } from '@/lib/session';

export const metadata = { title: 'Mis libros' };

// Renderizado en el servidor en cada petición (SSR): depende de la cookie de sesión del usuario
// y de su historial en la API, por eso va dentro de <Suspense> y no se cachea.
async function MisLibros({ searchParams }) {
  const session = await getSession();
  if (!session) redirect('/login?next=/libreria/mis-libros');

  const [historialApi, comprasSesion, catalogo, { pedido }] = await Promise.all([
    getHistorialCompras(session.token),
    getComprasSesion(),
    getCatalogo(),
    searchParams,
  ]);

  const pedidos = [...comprasSesion, ...historialApi].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const porId = new Map(catalogo.map((item) => [item.id, item]));

  // Un libro aparece una sola vez en la biblioteca, con la fecha de su compra más reciente
  const biblioteca = new Map();
  for (const p of pedidos) {
    for (const linea of p.items) {
      if (!biblioteca.has(linea.libroId) && porId.has(linea.libroId)) {
        biblioteca.set(linea.libroId, { item: porId.get(linea.libroId), fecha: p.fecha });
      }
    }
  }

  return (
    <>
      {pedido && (
        <div role="status" className="mb-8 rounded-2xl border border-free/30 bg-free-soft px-5 py-4 text-free">
          <p className="font-semibold">¡Compra confirmada!</p>
          <p className="text-sm">
            Tu pedido <span className="font-mono">{pedido}</span> está listo para recoger en el mostrador de la librería.
          </p>
        </div>
      )}

      <section>
        <h2 className="text-2xl font-semibold">Tu biblioteca ({biblioteca.size})</h2>
        {biblioteca.size === 0 ? (
          <p className="mt-4 text-ink-soft">Todavía no has comprado ningún libro.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
            {[...biblioteca.values()].map(({ item, fecha }) => (
              <li key={item.id}>
                <Link href={`/libreria/libros/${item.id}`} className="group block">
                  <BookCover item={item} sizes="(min-width: 1024px) 160px, 45vw" />
                  <p className="mt-2 line-clamp-2 text-sm font-semibold group-hover:text-accent">{item.titulo}</p>
                  <p className="text-xs text-ink-soft">Comprado el {formatFecha(fecha)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Historial de pedidos</h2>
        <ul className="mt-6 space-y-4">
          {pedidos.map((p) => (
            <li key={p.id} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-sm font-semibold">{p.id}</p>
                <p className="text-sm text-ink-soft">
                  {formatFecha(p.fecha)} ·{' '}
                  <span className="rounded-full bg-forest-soft px-2 py-0.5 text-xs font-semibold capitalize text-forest">
                    {p.estado}
                  </span>
                </p>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {p.items.map((linea) => (
                  <li key={linea.libroId} className="flex justify-between gap-4">
                    <span>
                      {porId.get(linea.libroId)?.titulo ?? `Producto ${linea.libroId}`}{' '}
                      <span className="text-ink-soft">× {linea.cantidad}</span>
                    </span>
                    <span>{formatPrecio(linea.cantidad * linea.precioUnitario)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-3 text-right font-semibold">Total {formatPrecio(p.total)}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function MisLibrosPage({ searchParams }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">Tu cuenta</p>
      <h1 className="mt-2 mb-8 text-4xl font-semibold">Mis libros</h1>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-paper-deep" />}>
        <MisLibros searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
