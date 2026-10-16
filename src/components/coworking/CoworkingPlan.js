'use client';

// Client Component: el plano se actualiza solo cada 30 s pidiendo la ocupación a la API simulada
// desde el navegador (se ve en la pestaña Red/Network), y al pasar el ratón por un espacio muestra su ficha.
// Necesita estado (useState), efectos (setInterval) y eventos (hover/foco): no puede ser Server Component.
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { etiquetasTipoEspacio, formatPrecio } from '@/lib/format';
import styles from './Plano.module.css';

const INTERVALO_MS = 30_000;

const decoracion = [
  { id: 'recepcion', texto: 'Recepción', posicion: { x: 5, y: 8, w: 2, h: 2 } },
  { id: 'pasillo', texto: 'Pasillo', posicion: { x: 7, y: 1, w: 1, h: 9 } },
  { id: 'paso', texto: 'Zona de paso', posicion: { x: 1, y: 5, w: 6, h: 1 } },
];

function posicionCss({ x, y, w, h }) {
  return { '--x': x, '--y': y, '--w': w, '--h': h };
}

export default function CoworkingPlan({ espacios, ocupacionInicial, apiUrl }) {
  const [ocupacion, setOcupacion] = useState(ocupacionInicial);
  const [actualizadoA, setActualizadoA] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [seleccion, setSeleccion] = useState(null);

  const refrescar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`${apiUrl}/coworking/ocupacion`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      setOcupacion(await res.json());
      setActualizadoA(new Date().toLocaleTimeString('es-ES'));
      setError(null);
    } catch {
      setError('No se pudo actualizar la ocupación. Se reintentará en unos segundos.');
    } finally {
      setCargando(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    const timer = setInterval(refrescar, INTERVALO_MS);
    return () => clearInterval(timer);
  }, [refrescar]);

  const estadoDe = (id) => ocupacion.estados.find((estado) => estado.espacioId === id) ?? { estado: 'libre' };
  const ocupados = ocupacion.estados.filter((estado) => estado.estado === 'ocupado').length;
  const espacioSeleccionado = espacios.find((espacio) => espacio.id === seleccion);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-ink-soft">
            {ocupacion.planta} · {espacios.length - ocupados} libres de {espacios.length} ·{' '}
            {actualizadoA ? `actualizado a las ${actualizadoA}` : 'datos de la carga inicial'}
          </p>
          <button type="button" onClick={refrescar} disabled={cargando} className="btn-ghost px-4 py-1.5">
            {cargando ? 'Actualizando…' : 'Actualizar ahora'}
          </button>
        </div>
        {error && (
          <p role="alert" className="mb-3 rounded-xl bg-busy-soft px-3 py-2 text-sm text-busy">
            {error}
          </p>
        )}

        <div className="overflow-x-auto pb-2">
          <div className={styles.plano} onMouseLeave={() => setSeleccion(null)}>
            {decoracion.map((d) => (
              <div key={d.id} className={styles.decoracion} style={posicionCss(d.posicion)} aria-hidden="true">
                {d.texto}
              </div>
            ))}
            {espacios.map((espacio) => {
              const estado = estadoDe(espacio.id);
              const ocupado = estado.estado === 'ocupado';
              return (
                <Link
                  key={espacio.id}
                  href={`/coworking/espacios/${espacio.id}`}
                  style={posicionCss(espacio.posicion)}
                  onMouseEnter={() => setSeleccion(espacio.id)}
                  onFocus={() => setSeleccion(espacio.id)}
                  className={`${styles.espacio} ${ocupado ? styles.ocupado : styles.libre} ${seleccion === espacio.id ? styles.activo : ''}`}
                  aria-label={`${espacio.nombre}: ${ocupado ? `ocupado hasta las ${estado.hasta}` : 'libre'}`}
                >
                  <span className={styles.codigo}>{espacio.id}</span>
                  <span>
                    <span className={styles.punto} aria-hidden="true" />
                    {ocupado ? `hasta ${estado.hasta}` : 'Libre'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <p className="mt-2 flex flex-wrap gap-4 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-free bg-free-soft" /> Libre
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-busy bg-busy-soft" /> Ocupado
          </span>
          <span>Pasa el ratón por un espacio para ver su información o haz clic para abrir su ficha.</span>
        </p>
      </div>

      {/* Ficha del espacio bajo el cursor */}
      <aside className="card h-fit p-5 lg:sticky lg:top-24" aria-live="polite">
        {espacioSeleccionado ? (
          <FichaEspacio espacio={espacioSeleccionado} estado={estadoDe(espacioSeleccionado.id)} />
        ) : (
          <div>
            <p className="eyebrow">Ocupación ahora</p>
            <p className="mt-2 font-display text-5xl font-semibold">
              {ocupados}
              <span className="text-2xl text-ink-soft">/{espacios.length}</span>
            </p>
            <p className="mt-1 text-sm text-ink-soft">espacios ocupados</p>
            <p className="mt-4 text-sm">Selecciona un espacio del plano para ver quién lo ocupa y cuándo queda libre.</p>
          </div>
        )}
      </aside>

      {/* Lista accesible con el estado de todos los espacios */}
      <div className="overflow-x-auto lg:col-span-2">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="mb-3 text-left font-display text-xl font-semibold">Estado de todos los espacios</caption>
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="py-2 pr-4 font-semibold">Espacio</th>
              <th className="py-2 pr-4 font-semibold">Estado</th>
              <th className="py-2 pr-4 font-semibold">Desde</th>
              <th className="py-2 pr-4 font-semibold">Se libera</th>
              <th className="py-2 font-semibold">Ocupado por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {espacios.map((espacio) => {
              const estado = estadoDe(espacio.id);
              const ocupado = estado.estado === 'ocupado';
              return (
                <tr key={espacio.id}>
                  <td className="py-2 pr-4">
                    <Link href={`/coworking/espacios/${espacio.id}`} className="font-semibold hover:text-accent">
                      {espacio.nombre}
                    </Link>
                    <span className="block text-xs text-ink-soft">{etiquetasTipoEspacio[espacio.tipo]}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ocupado ? 'bg-busy-soft text-busy' : 'bg-free-soft text-free'}`}
                    >
                      {ocupado ? 'Ocupado' : 'Libre'}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{ocupado ? estado.desde : '—'}</td>
                  <td className="py-2 pr-4">{ocupado ? estado.hasta : '—'}</td>
                  <td className="py-2">
                    {ocupado ? (
                      <>
                        {estado.ocupadoPor}
                        <span className="block text-xs text-ink-soft">
                          {estado.perfil} · {estado.personas} {estado.personas === 1 ? 'persona' : 'personas'}
                        </span>
                      </>
                    ) : estado.proximaReserva ? (
                      <span className="text-ink-soft">
                        Próxima reserva {estado.proximaReserva.desde}–{estado.proximaReserva.hasta}
                      </span>
                    ) : (
                      <span className="text-ink-soft">Sin reservas hoy</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FichaEspacio({ espacio, estado }) {
  const ocupado = estado.estado === 'ocupado';
  return (
    <div>
      <p className="eyebrow">{etiquetasTipoEspacio[espacio.tipo]}</p>
      <h2 className="mt-1 text-2xl font-semibold">{espacio.nombre}</h2>
      <p className="text-sm text-ink-soft">
        {espacio.zona} · hasta {espacio.capacidad} {espacio.capacidad === 1 ? 'persona' : 'personas'} ·{' '}
        {formatPrecio(espacio.precioHora)}/h
      </p>
      <div className={`mt-4 rounded-xl px-4 py-3 ${ocupado ? 'bg-busy-soft text-busy' : 'bg-free-soft text-free'}`}>
        {ocupado ? (
          <>
            <p className="font-semibold">Ocupado de {estado.desde} a {estado.hasta}</p>
            <p className="text-sm">{estado.ocupadoPor}</p>
            <p className="text-xs opacity-80">{estado.perfil}</p>
          </>
        ) : (
          <>
            <p className="font-semibold">Libre ahora</p>
            <p className="text-sm">
              {estado.proximaReserva
                ? `Próxima reserva de ${estado.proximaReserva.desde} a ${estado.proximaReserva.hasta}`
                : 'Sin más reservas hoy'}
            </p>
          </>
        )}
      </div>
      <p className="mt-4 text-sm">{espacio.descripcion}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {espacio.equipamiento.map((equipo) => (
          <li key={equipo} className="rounded-full bg-paper-deep px-2.5 py-1 text-xs">
            {equipo}
          </li>
        ))}
      </ul>
    </div>
  );
}
