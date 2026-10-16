const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const fechaLarga = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function formatPrecio(valor) {
  return euros.format(valor);
}

// Las fechas llegan como 'AAAA-MM-DD'
export function formatFecha(iso) {
  return fechaLarga.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}

export const etiquetasTipoEspacio = {
  puesto: 'Puesto individual',
  sala: 'Sala de reuniones',
  mesa: 'Mesa compartida',
  cabina: 'Cabina',
  aula: 'Aula de formación',
};
