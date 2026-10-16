'use server';

import { getCatalogo, postCompra } from '@/lib/api';
import { getSession, guardarCompra } from '@/lib/session';

// Recibe [{ id, cantidad }] desde el carrito. Los precios se recalculan en el servidor
// con el catálogo de la API: nunca se confía en los precios que envía el navegador.
export async function comprar(lineas) {
  const session = await getSession();
  if (!session) return { error: 'Tu sesión ha caducado. Vuelve a iniciar sesión.' };

  const catalogo = await getCatalogo();
  const items = [];
  for (const { id, cantidad } of lineas) {
    const item = catalogo.find((libro) => libro.id === Number(id));
    const unidades = Math.floor(Number(cantidad));
    if (!item || !(unidades > 0)) return { error: 'El carrito contiene productos no válidos.' };
    if (item.stock < unidades) return { error: `No hay suficiente stock de «${item.titulo}».` };
    items.push({ libroId: item.id, cantidad: unidades, precioUnitario: item.precio });
  }
  if (items.length === 0) return { error: 'El carrito está vacío.' };

  const total = Math.round(items.reduce((suma, i) => suma + i.cantidad * i.precioUnitario, 0) * 100) / 100;

  try {
    const respuesta = await postCompra({ items, total }, session.token);
    const pedido = {
      id: `${respuesta.id}-${Date.now().toString(36).toUpperCase()}`,
      fecha: new Date().toISOString().slice(0, 10),
      estado: respuesta.estado,
      items,
      total,
    };
    await guardarCompra(pedido);
    return { pedido, mensaje: respuesta.mensaje };
  } catch {
    return { error: 'No se pudo registrar la compra. Inténtalo de nuevo.' };
  }
}
