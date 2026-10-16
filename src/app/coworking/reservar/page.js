import { Suspense } from 'react';
import ReservationForm from '@/components/coworking/ReservationForm';
import { getEspacios } from '@/lib/api';

export const metadata = { title: 'Reservar espacio' };

// Lee ?espacio=ID de la URL en el servidor para preseleccionar el espacio en el formulario (cliente)
async function Formulario({ searchParams }) {
  const [{ espacio }, espacios] = await Promise.all([searchParams, getEspacios()]);
  return <ReservationForm espacios={espacios} espacioInicial={espacio} />;
}

export default function ReservarPage({ searchParams }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">Reservas</p>
      <h1 className="mt-2 text-4xl font-semibold">Reserva tu espacio</h1>
      <p className="mt-3 mb-8 max-w-2xl text-ink-soft">
        Elige el espacio, el día y la franja horaria. Abrimos de lunes a viernes de 8:00 a 22:00.
      </p>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-paper-deep" />}>
        <Formulario searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
