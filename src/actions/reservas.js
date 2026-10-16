'use server';

import { getEspacio, postReserva } from '@/lib/api';
import { getSession, guardarReserva } from '@/lib/session';

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const APERTURA = '08:00';
const CIERRE = '22:00';

const minutos = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));

export async function reservar(_estadoPrevio, formData) {
  const valores = {
    espacioId: String(formData.get('espacioId') ?? ''),
    fecha: String(formData.get('fecha') ?? ''),
    desde: String(formData.get('desde') ?? ''),
    hasta: String(formData.get('hasta') ?? ''),
    personas: Number(formData.get('personas') ?? 1),
    motivo: String(formData.get('motivo') ?? '').trim().slice(0, 120),
  };
  const fallo = (error) => ({ error, valores });

  const session = await getSession();
  if (!session) return fallo('Tu sesión ha caducado. Vuelve a iniciar sesión.');

  const espacio = await getEspacio(valores.espacioId);
  if (!espacio) return fallo('Selecciona un espacio de la lista.');
  if (!FECHA.test(valores.fecha)) return fallo('Selecciona una fecha.');

  // Se admite el día anterior en UTC para no rechazar reservas de "hoy" en husos horarios americanos
  const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (valores.fecha < ayer) return fallo('No se puede reservar en una fecha pasada.');

  if (!HORA.test(valores.desde) || !HORA.test(valores.hasta)) return fallo('Indica la hora de inicio y de fin.');
  if (valores.desde < APERTURA || valores.hasta > CIERRE) return fallo(`El coworking abre de ${APERTURA} a ${CIERRE}.`);
  const duracion = minutos(valores.hasta) - minutos(valores.desde);
  if (duracion < 30) return fallo('La reserva debe durar al menos 30 minutos.');
  if (duracion > 8 * 60) return fallo('La reserva no puede superar las 8 horas.');

  if (!Number.isInteger(valores.personas) || valores.personas < 1 || valores.personas > espacio.capacidad) {
    return fallo(`${espacio.nombre} admite entre 1 y ${espacio.capacidad} persona(s).`);
  }

  try {
    const respuesta = await postReserva(valores, session.token);
    const reserva = {
      id: `${respuesta.id}-${Date.now().toString(36).toUpperCase()}`,
      ...valores,
      estado: respuesta.estado,
      importe: Math.round((duracion / 60) * espacio.precioHora * 100) / 100,
    };
    await guardarReserva(reserva);
    return { reserva, mensaje: respuesta.mensaje };
  } catch {
    return fallo('No se pudo registrar la reserva. Inténtalo de nuevo.');
  }
}
