'use client';

// Client Component: formulario controlado (el precio estimado y el máximo de personas cambian
// según el espacio y las horas elegidas) que envía los datos a la Server Action `reservar`.
// useActionState aporta el estado de envío (pendiente) y la respuesta de la acción.
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { reservar } from '@/actions/reservas';
import { etiquetasTipoEspacio, formatFecha, formatPrecio } from '@/lib/format';

const HORAS = Array.from({ length: 29 }, (_, i) => {
  const minutos = 8 * 60 + i * 30;
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
});

const minutosDe = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));

export default function ReservationForm(props) {
  // Cambiar la key reinicia el formulario y el estado de la acción para hacer otra reserva
  const [intento, setIntento] = useState(0);
  return <Formulario key={intento} {...props} onNuevaReserva={() => setIntento((n) => n + 1)} />;
}

function Formulario({ espacios, espacioInicial, onNuevaReserva }) {
  const [estado, accion, pendiente] = useActionState(reservar, null);
  const [campos, setCampos] = useState({
    espacioId: espacios.some((e) => e.id === espacioInicial) ? espacioInicial : espacios[0].id,
    fecha: '',
    desde: '10:00',
    hasta: '12:00',
    personas: 1,
    motivo: '',
  });
  const cambiar = (campo) => (event) => setCampos((actual) => ({ ...actual, [campo]: event.target.value }));

  const espacio = espacios.find((e) => e.id === campos.espacioId);
  const horas = Math.max(0, (minutosDe(campos.hasta) - minutosDe(campos.desde)) / 60);
  const zonas = [...new Set(espacios.map((e) => e.zona))];

  if (estado?.reserva) {
    const { reserva } = estado;
    const reservado = espacios.find((e) => e.id === reserva.espacioId);
    return (
      <div className="card mx-auto max-w-xl p-8 text-center" role="status">
        <p className="mx-auto flex size-14 items-center justify-center rounded-full bg-free-soft text-2xl text-free">✓</p>
        <h2 className="mt-4 text-3xl font-semibold">Reserva confirmada</h2>
        <p className="mt-2 text-ink-soft">{estado.mensaje}</p>
        <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-y-2 text-left text-sm">
          <dt className="text-ink-soft">Código</dt>
          <dd className="font-mono font-semibold">{reserva.id}</dd>
          <dt className="text-ink-soft">Espacio</dt>
          <dd className="font-semibold">{reservado?.nombre}</dd>
          <dt className="text-ink-soft">Fecha</dt>
          <dd>{formatFecha(reserva.fecha)}</dd>
          <dt className="text-ink-soft">Horario</dt>
          <dd>
            {reserva.desde} – {reserva.hasta}
          </dd>
          <dt className="text-ink-soft">Importe</dt>
          <dd>{formatPrecio(reserva.importe)} (en recepción)</dd>
        </dl>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/coworking/mis-reservas" className="btn-primary">
            Ver mis reservas
          </Link>
          <button type="button" onClick={onNuevaReserva} className="btn-ghost">
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <form action={accion} className="card space-y-5 p-6">
        <div>
          <label htmlFor="espacioId" className="label">
            Espacio
          </label>
          <select id="espacioId" name="espacioId" value={campos.espacioId} onChange={cambiar('espacioId')} className="field">
            {zonas.map((zona) => (
              <optgroup key={zona} label={zona}>
                {espacios
                  .filter((e) => e.zona === zona)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} · hasta {e.capacidad} {e.capacidad === 1 ? 'persona' : 'personas'}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="fecha" className="label">
              Fecha
            </label>
            <input id="fecha" name="fecha" type="date" required value={campos.fecha} onChange={cambiar('fecha')} className="field" />
          </div>
          <div>
            <label htmlFor="desde" className="label">
              Desde
            </label>
            <select id="desde" name="desde" value={campos.desde} onChange={cambiar('desde')} className="field">
              {HORAS.slice(0, -1).map((hora) => (
                <option key={hora}>{hora}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hasta" className="label">
              Hasta
            </label>
            <select id="hasta" name="hasta" value={campos.hasta} onChange={cambiar('hasta')} className="field">
              {HORAS.slice(1).map((hora) => (
                <option key={hora}>{hora}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <div>
            <label htmlFor="personas" className="label">
              Personas
            </label>
            <input
              id="personas"
              name="personas"
              type="number"
              min="1"
              max={espacio.capacidad}
              value={campos.personas}
              onChange={cambiar('personas')}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="motivo" className="label">
              Motivo (opcional)
            </label>
            <input
              id="motivo"
              name="motivo"
              maxLength={120}
              value={campos.motivo}
              onChange={cambiar('motivo')}
              placeholder="Ej.: reunión del grupo de TFM"
              className="field"
            />
          </div>
        </div>

        {estado?.error && (
          <p role="alert" className="rounded-xl bg-busy-soft px-3 py-2 text-sm text-busy">
            {estado.error}
          </p>
        )}

        <button type="submit" disabled={pendiente} className="btn-accent w-full sm:w-auto">
          {pendiente ? 'Reservando…' : 'Confirmar reserva'}
        </button>
        <p className="text-xs text-ink-soft">Sin pasarela de pago: el importe se abona en recepción el día de la reserva.</p>
      </form>

      <aside className="card h-fit p-6">
        <p className="eyebrow">{etiquetasTipoEspacio[espacio.tipo]}</p>
        <h2 className="mt-1 text-2xl font-semibold">{espacio.nombre}</h2>
        <p className="mt-2 text-sm text-ink-soft">{espacio.descripcion}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {espacio.equipamiento.map((equipo) => (
            <li key={equipo} className="rounded-full bg-paper-deep px-2.5 py-1 text-xs">
              {equipo}
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Precio por hora</dt>
            <dd>{formatPrecio(espacio.precioHora)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">Duración</dt>
            <dd>{horas > 0 ? `${horas} h` : '—'}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Importe estimado</dt>
            <dd>{formatPrecio(horas * espacio.precioHora)}</dd>
          </div>
        </dl>
        <Link href={`/coworking/espacios/${espacio.id}`} className="mt-4 inline-block text-sm font-semibold text-forest underline">
          Ver ficha y estado del espacio
        </Link>
      </aside>
    </div>
  );
}
