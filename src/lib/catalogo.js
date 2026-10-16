// Filtros y orden del catálogo. Son funciones puras: se ejecutan en el servidor con los searchParams de la URL.

export const ordenes = {
  ventas: { etiqueta: 'Más vendidos', comparar: (a, b) => b.ventasUltimasSemanas - a.ventasUltimasSemanas },
  recientes: { etiqueta: 'Más recientes', comparar: (a, b) => b.anio - a.anio },
  'precio-asc': { etiqueta: 'Precio: menor a mayor', comparar: (a, b) => a.precio - b.precio },
  'precio-desc': { etiqueta: 'Precio: mayor a menor', comparar: (a, b) => b.precio - a.precio },
  titulo: { etiqueta: 'Título (A-Z)', comparar: (a, b) => a.titulo.localeCompare(b.titulo, 'es') },
};

function primero(valor) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export function leerFiltros(searchParams) {
  const numero = (clave) => {
    const valor = Number(primero(searchParams[clave]));
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  };
  const orden = primero(searchParams.orden);
  return {
    q: (primero(searchParams.q) ?? '').trim(),
    tipo: primero(searchParams.tipo) ?? '',
    idioma: primero(searchParams.idioma) ?? '',
    desde: numero('desde'),
    hasta: numero('hasta'),
    precioMax: numero('precioMax'),
    disponibles: primero(searchParams.disponibles) === '1',
    orden: orden in ordenes ? orden : 'ventas',
  };
}

export function filtrarCatalogo(items, filtros) {
  const q = filtros.q.toLocaleLowerCase('es');
  return items
    .filter((item) => !q || `${item.titulo} ${item.autor}`.toLocaleLowerCase('es').includes(q))
    .filter((item) => !filtros.tipo || item.tipo === filtros.tipo)
    .filter((item) => !filtros.idioma || item.idioma === filtros.idioma)
    .filter((item) => !filtros.desde || item.anio >= filtros.desde)
    .filter((item) => !filtros.hasta || item.anio <= filtros.hasta)
    .filter((item) => !filtros.precioMax || item.precio <= filtros.precioMax)
    .filter((item) => !filtros.disponibles || item.stock > 0)
    .sort(ordenes[filtros.orden].comparar);
}

// Valores posibles de cada filtro, calculados a partir del catálogo que devuelve la API
export function opcionesDeFiltro(items) {
  return {
    anios: [...new Set(items.map((item) => item.anio))].sort((a, b) => a - b),
    idiomas: [...new Set(items.map((item) => item.idioma))].sort(),
    precioMaximo: Math.ceil(Math.max(...items.map((item) => item.precio))),
  };
}
