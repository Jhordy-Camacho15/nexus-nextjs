import BookCard from './BookCard';

export default function BookGrid({ items, numerado = false }) {
  if (items.length === 0) {
    return (
      <div className="card px-6 py-12 text-center">
        <p className="font-display text-xl">No hay resultados con estos filtros</p>
        <p className="mt-2 text-sm text-ink-soft">Prueba a ampliar el rango de años o a quitar algún filtro.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, index) => (
        <li key={item.id}>
          <BookCard item={item} posicion={numerado ? index + 1 : undefined} eager={index < 5} />
        </li>
      ))}
    </ul>
  );
}
