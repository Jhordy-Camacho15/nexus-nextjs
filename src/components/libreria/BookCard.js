// Server Component: la ficha rápida que aparece al pasar el ratón (o al enfocar con teclado)
// se resuelve solo con CSS (group-hover / group-focus-within), sin JavaScript en el cliente.
// Solo el botón de añadir al carrito es un Client Component.
import Link from 'next/link';
import { formatPrecio } from '@/lib/format';
import AddToCartButton from './AddToCartButton';
import BookCover from './BookCover';

export default function BookCard({ item, posicion, eager = false }) {
  const href = `/libreria/libros/${item.id}`;

  return (
    <article className="group relative flex h-full flex-col">
      <Link href={href} className="relative block rounded-lg" aria-describedby={`ficha-${item.id}`}>
        <BookCover item={item} eager={eager} />
        {posicion && (
          <span className="absolute -left-2 -top-2 z-10 flex size-9 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-white shadow">
            {posicion}
          </span>
        )}
        {/* Ficha rápida al pasar el ratón */}
        <div
          id={`ficha-${item.id}`}
          className="pointer-events-none absolute inset-0 flex flex-col justify-end rounded-lg bg-ink/90 p-3 text-paper opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100"
        >
          <p className="line-clamp-5 text-xs leading-relaxed">{item.descripcion}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-paper/80">
            <dt className="sr-only">Año</dt>
            <dd>Año {item.anio}</dd>
            <dt className="sr-only">Páginas</dt>
            <dd>{item.paginas} págs.</dd>
            <dt className="sr-only">Idioma</dt>
            <dd>{item.idioma}</dd>
            <dt className="sr-only">Stock</dt>
            <dd className={item.stock > 0 ? '' : 'font-semibold text-[#fca5a5]'}>
              {item.stock > 0 ? `${item.stock} en stock` : 'Agotado'}
            </dd>
          </dl>
          <span className="mt-3 text-xs font-semibold underline underline-offset-4">Ver ficha completa →</span>
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          {item.tipo === 'revista' ? 'Revista' : 'Libro'} · {item.anio}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug">
          <Link href={href} className="hover:text-accent">
            {item.titulo}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{item.autor}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="font-semibold">{formatPrecio(item.precio)}</span>
          <span className="w-24">
            <AddToCartButton item={item} compacto />
          </span>
        </div>
      </div>
    </article>
  );
}
