import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import MiniPlano from '@/components/coworking/MiniPlano';
import { getEspacio, getEspacios, getOcupacion } from '@/lib/api';
import { etiquetasTipoEspacio, formatPrecio } from '@/lib/format';

// Una página estática por espacio (SSG). Solo el bloque "Estado ahora" se pide en cada visita.
export async function generateStaticParams() {
  const espacios = await getEspacios();
  return espacios.map((espacio) => ({ id: espacio.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const espacio = await getEspacio(id);
  return { title: espacio ? espacio.nombre : 'Espacio no encontrado' };
}

// Dato que cambia constantemente: sin caché y transmitido en streaming
async function EstadoAhora({ id }) {
  const ocupacion = await getOcupacion();
  const estado = ocupacion.estados.find((e) => e.espacioId === id) ?? { estado: 'libre' };
  const ocupado = estado.estado === 'ocupado';

  return (
    <div className={`rounded-2xl px-5 py-4 ${ocupado ? 'bg-busy-soft text-busy' : 'bg-free-soft text-free'}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Estado ahora</p>
      {ocupado ? (
        <>
          <p className="mt-1 font-display text-2xl font-semibold">
            Ocupado de {estado.desde} a {estado.hasta}
          </p>
          <p className="mt-1">
            {estado.ocupadoPor} · {estado.perfil} · {estado.personas} {estado.personas === 1 ? 'persona' : 'personas'}
          </p>
        </>
      ) : (
        <>
          <p className="mt-1 font-display text-2xl font-semibold">Libre</p>
          <p className="mt-1">
            {estado.proximaReserva
              ? `Próxima reserva de ${estado.proximaReserva.desde} a ${estado.proximaReserva.hasta}`
              : 'Sin más reservas para hoy'}
          </p>
        </>
      )}
    </div>
  );
}

async function Detalle({ params }) {
  const { id } = await params;
  const [espacio, espacios] = await Promise.all([getEspacio(id), getEspacios()]);
  if (!espacio) notFound();

  return (
    <>
      <nav aria-label="Ruta de navegación" className="text-sm text-ink-soft">
        <Link href="/coworking" className="hover:text-ink">
          Coworking
        </Link>
        {' / '}
        <span className="text-ink">{espacio.nombre}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <article>
          <p className="eyebrow">{etiquetasTipoEspacio[espacio.tipo]}</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{espacio.nombre}</h1>
          <p className="mt-4 max-w-prose text-lg text-ink-soft">{espacio.descripcion}</p>

          <div className="mt-8">
            <Suspense fallback={<div className="h-28 animate-pulse rounded-2xl bg-paper-deep" />}>
              <EstadoAhora id={espacio.id} />
            </Suspense>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="card p-4">
              <dt className="text-xs uppercase tracking-wide text-ink-soft">Capacidad</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">
                {espacio.capacidad} {espacio.capacidad === 1 ? 'persona' : 'personas'}
              </dd>
            </div>
            <div className="card p-4">
              <dt className="text-xs uppercase tracking-wide text-ink-soft">Precio</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">{formatPrecio(espacio.precioHora)}/h</dd>
            </div>
            <div className="card col-span-2 p-4 sm:col-span-1">
              <dt className="text-xs uppercase tracking-wide text-ink-soft">Código</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">{espacio.id}</dd>
            </div>
          </dl>

          <h2 className="mt-10 text-xl font-semibold">Equipamiento</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {espacio.equipamiento.map((equipo) => (
              <li key={equipo} className="rounded-full border border-line bg-card px-3 py-1.5 text-sm">
                {equipo}
              </li>
            ))}
          </ul>

          <Link href={`/coworking/reservar?espacio=${espacio.id}`} className="btn-accent mt-10">
            Reservar este espacio
          </Link>
        </article>

        <aside>
          <p className="label">Ubicación en la planta · {espacio.zona}</p>
          <MiniPlano espacios={espacios} resaltado={espacio.id} />
        </aside>
      </div>
    </>
  );
}

export default function EspacioPage({ params }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Suspense fallback={<div className="h-[28rem] animate-pulse rounded-2xl bg-paper-deep" />}>
        <Detalle params={params} />
      </Suspense>
    </div>
  );
}
