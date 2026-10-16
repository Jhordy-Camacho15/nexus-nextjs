'use client';

// Client Component: el carrito vive en el navegador (contexto + localStorage) y la vista es interactiva
// (cambiar cantidades, quitar, confirmar). La compra se envía a una Server Action que valida
// precios y stock en el servidor y la registra en la API simulada.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { comprar } from '@/actions/compras';
import { useCart } from '@/context/CartContext';
import { formatPrecio } from '@/lib/format';
import BookCover from './BookCover';

export default function CartView() {
  const { items, cargado, actualizarCantidad, quitar, vaciar, totalPrecio, totalUnidades } = useCart();
  const [error, setError] = useState(null);
  const [pendiente, startTransition] = useTransition();
  const router = useRouter();

  function confirmarCompra() {
    setError(null);
    startTransition(async () => {
      const resultado = await comprar(items.map(({ id, cantidad }) => ({ id, cantidad })));
      if (resultado.error) {
        setError(resultado.error);
        return;
      }
      vaciar();
      router.push(`/libreria/mis-libros?pedido=${encodeURIComponent(resultado.pedido.id)}`);
    });
  }

  if (!cargado) {
    return <div className="h-64 animate-pulse rounded-2xl bg-paper-deep" aria-label="Cargando carrito" />;
  }

  if (items.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="font-display text-2xl">Tu carrito está vacío</p>
        <p className="mt-2 text-ink-soft">Añade libros o revistas desde el catálogo.</p>
        <Link href="/libreria/catalogo" className="btn-primary mt-6">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 p-4">
            <Link href={`/libreria/libros/${item.id}`} className="w-20 shrink-0">
              <BookCover item={item} sizes="80px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link href={`/libreria/libros/${item.id}`} className="font-display text-lg font-semibold leading-snug hover:text-accent">
                {item.titulo}
              </Link>
              <p className="truncate text-sm text-ink-soft">{item.autor}</p>
              <p className="mt-1 text-sm">{formatPrecio(item.precio)} / unidad</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                    className="size-9 rounded-full text-lg hover:bg-paper-deep"
                    aria-label={`Quitar una unidad de ${item.titulo}`}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                    className="size-9 rounded-full text-lg hover:bg-paper-deep disabled:opacity-40"
                    aria-label={`Añadir una unidad de ${item.titulo}`}
                  >
                    +
                  </button>
                </div>
                <span className="font-semibold">{formatPrecio(item.precio * item.cantidad)}</span>
                <button type="button" onClick={() => quitar(item.id)} className="text-sm text-ink-soft underline hover:text-busy">
                  Quitar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Productos</dt>
            <dd>{totalUnidades}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">Recogida en librería</dt>
            <dd>Gratis</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrecio(totalPrecio)}</dd>
          </div>
        </dl>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-busy-soft px-3 py-2 text-sm text-busy">
            {error}
          </p>
        )}
        <button type="button" onClick={confirmarCompra} disabled={pendiente} className="btn-accent mt-6 w-full">
          {pendiente ? 'Registrando compra…' : 'Confirmar compra'}
        </button>
        <p className="mt-3 text-xs text-ink-soft">
          Sin pasarela de pago: abonas el pedido al recogerlo en el mostrador de la librería.
        </p>
      </aside>
    </div>
  );
}
