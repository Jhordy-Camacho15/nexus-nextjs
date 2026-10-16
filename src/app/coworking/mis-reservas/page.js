import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getEspacios, getHistorialReservas } from '@/lib/api';
import { formatFecha, formatPrecio } from '@/lib/format';
import { getReservasSesion, getSession } from '@/lib/session';

export const metadata = { title: 'Mis reservas' };

// SSR por petición: combina el historial de la API con las reservas hechas en esta sesión (cookie)
async function MisReservas() {
  const session = await getSession();
  if (!session) redirect('/login?next=/coworking/mis-reservas');

  const [historialApi, reservasSesion, espacios] = await Promise.all([
    getHistorialReservas(session.token),
    getReservasSesion(),
    getEspacios(),
  ]);
  const reservas = [...reservasSesion, ...historialApi].sort((a, b) =>
    `${b.fecha}${b.desde}`.localeCompare(`${a.fecha}${a.desde}`),
  );

  if (reservas.length === 0) {
    return (
      <div className="card px-6 py-12 text-center">
        <p className="font-display text-xl">Aún no tienes reservas</p>
        <Link href="/coworking/reservar" className="btn-primary mt-6">
          Reservar un espacio
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reservas.map((reserva) => {
        const espacio = espacios.find((e) => e.id === reserva.espacioId);
        return (
          <li key={reserva.id} className="card flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-forest font-display text-lg font-bold text-paper">
              {reserva.espacioId}
            </div>
            <div className="min-w-48 flex-1">
              <Link href={`/coworking/espacios/${reserva.espacioId}`} className="font-display text-lg font-semibold hover:text-accent">
                {espacio?.nombre ?? reserva.espacioId}
              </Link>
              <p className="text-sm text-ink-soft">
                {formatFecha(reserva.fecha)} · {reserva.desde} – {reserva.hasta} · {reserva.personas}{' '}
                {reserva.personas === 1 ? 'persona' : 'personas'}
              </p>
              {reserva.motivo && <p className="text-sm">{reserva.motivo}</p>}
            </div>
            <div className="text-right">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                  reserva.estado === 'confirmada' ? 'bg-free-soft text-free' : 'bg-paper-deep text-ink-soft'
                }`}
              >
                {reserva.estado}
              </span>
              <p className="mt-1 font-mono text-xs text-ink-soft">{reserva.id}</p>
              {reserva.importe !== undefined && <p className="text-sm">{formatPrecio(reserva.importe)}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function MisReservasPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="eyebrow">Tu cuenta</p>
      <h1 className="mt-2 mb-8 text-4xl font-semibold">Mis reservas</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-paper-deep" />}>
        <MisReservas />
      </Suspense>
    </div>
  );
}
