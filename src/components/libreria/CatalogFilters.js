'use client';

// Client Component: formulario de filtros controlado por el usuario. Cada cambio actualiza
// los searchParams de la URL; la página (Server Component) lee esos parámetros y filtra en el servidor.
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

const ordenes = [
  ['ventas', 'Más vendidos'],
  ['recientes', 'Más recientes'],
  ['precio-asc', 'Precio: menor a mayor'],
  ['precio-desc', 'Precio: mayor a menor'],
  ['titulo', 'Título (A-Z)'],
];

export default function CatalogFilters({ opciones }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendiente, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState(searchParams.get('q') ?? '');
  const precioMax = Number(searchParams.get('precioMax')) || opciones.precioMaximo;

  function actualizar(cambios) {
    const params = new URLSearchParams(searchParams);
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === '' || valor === null || valor === false) params.delete(clave);
      else params.set(clave, String(valor));
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  // La búsqueda por texto espera 350 ms desde la última tecla antes de actualizar la URL.
  // "Limpiar filtros" cancela la búsqueda pendiente para que no vuelva a escribir los filtros antiguos.
  const temporizador = useRef(null);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  function buscar(valor) {
    setBusqueda(valor);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => actualizar({ q: valor.trim() }), 350);
  }

  function limpiar() {
    clearTimeout(temporizador.current);
    setBusqueda('');
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  const hayFiltros = [...searchParams.keys()].length > 0;

  return (
    <form className="mt-8 space-y-5" onSubmit={(event) => event.preventDefault()} aria-busy={pendiente}>
      <div className="flex items-center justify-between">
        <p className="label mb-0">Filtros</p>
        {pendiente && <span className="text-xs text-ink-soft">Actualizando…</span>}
      </div>

      <div>
        <label htmlFor="filtro-q" className="label">
          Buscar
        </label>
        <input
          id="filtro-q"
          type="search"
          value={busqueda}
          onChange={(event) => buscar(event.target.value)}
          placeholder="Título o autor"
          className="field"
        />
      </div>

      <fieldset>
        <legend className="label">Año de publicación</legend>
        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label="Desde el año"
            value={searchParams.get('desde') ?? ''}
            onChange={(event) => actualizar({ desde: event.target.value })}
            className="field"
          >
            <option value="">Desde</option>
            {opciones.anios.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
          <select
            aria-label="Hasta el año"
            value={searchParams.get('hasta') ?? ''}
            onChange={(event) => actualizar({ hasta: event.target.value })}
            className="field"
          >
            <option value="">Hasta</option>
            {opciones.anios.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Tipo</legend>
        <div className="flex gap-1 rounded-full border border-line bg-card p-1">
          {[
            ['', 'Todo'],
            ['libro', 'Libros'],
            ['revista', 'Revistas'],
          ].map(([valor, etiqueta]) => {
            const activo = (searchParams.get('tipo') ?? '') === valor;
            return (
              <button
                key={etiqueta}
                type="button"
                onClick={() => actualizar({ tipo: valor })}
                aria-pressed={activo}
                className={`flex-1 rounded-full px-2 py-1 text-xs font-semibold ${activo ? 'bg-ink text-paper' : 'text-ink-soft'}`}
              >
                {etiqueta}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="filtro-idioma" className="label">
          Idioma
        </label>
        <select
          id="filtro-idioma"
          value={searchParams.get('idioma') ?? ''}
          onChange={(event) => actualizar({ idioma: event.target.value })}
          className="field"
        >
          <option value="">Todos</option>
          {opciones.idiomas.map((idioma) => (
            <option key={idioma}>{idioma}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-precio" className="label">
          Precio máximo: {precioMax} €
        </label>
        <input
          id="filtro-precio"
          type="range"
          min="5"
          max={opciones.precioMaximo}
          step="5"
          defaultValue={precioMax}
          key={searchParams.get('precioMax') ?? 'sin-precio'}
          onPointerUp={(event) => actualizar({ precioMax: Number(event.currentTarget.value) >= opciones.precioMaximo ? '' : event.currentTarget.value })}
          onKeyUp={(event) => actualizar({ precioMax: Number(event.currentTarget.value) >= opciones.precioMaximo ? '' : event.currentTarget.value })}
          className="w-full accent-forest"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={searchParams.get('disponibles') === '1'}
          onChange={(event) => actualizar({ disponibles: event.target.checked ? '1' : '' })}
          className="size-4 accent-forest"
        />
        Solo disponibles en stock
      </label>

      <div>
        <label htmlFor="filtro-orden" className="label">
          Ordenar por
        </label>
        <select
          id="filtro-orden"
          value={searchParams.get('orden') ?? 'ventas'}
          onChange={(event) => actualizar({ orden: event.target.value === 'ventas' ? '' : event.target.value })}
          className="field"
        >
          {ordenes.map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      {hayFiltros && (
        <button
          type="button"
          onClick={limpiar}
          className="btn-ghost w-full"
        >
          Limpiar filtros
        </button>
      )}
    </form>
  );
}
