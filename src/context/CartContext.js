'use client';

// Client Component: el carrito es estado compartido entre páginas que vive en el navegador
// (localStorage), algo que un Server Component no puede tener. Se lee con useSyncExternalStore,
// que además mantiene el carrito sincronizado entre pestañas.
import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'nexus_carrito';

// ---------- Almacén externo sobre localStorage ----------
const suscriptores = new Set();
let respaldoEnMemoria = null; // se usa si localStorage no está disponible (p. ej. navegación privada)

function getSnapshot() {
  if (respaldoEnMemoria !== null) return respaldoEnMemoria;
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

// En el servidor no existe localStorage: null indica "carrito aún no cargado"
function getServerSnapshot() {
  return null;
}

function subscribe(callback) {
  const alCambiarOtraPestaña = (event) => event.key === STORAGE_KEY && callback();
  suscriptores.add(callback);
  window.addEventListener('storage', alCambiarOtraPestaña);
  return () => {
    suscriptores.delete(callback);
    window.removeEventListener('storage', alCambiarOtraPestaña);
  };
}

function parsear(raw) {
  try {
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function guardar(transformar) {
  const raw = JSON.stringify(transformar(parsear(getSnapshot())));
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    respaldoEnMemoria = raw;
  }
  suscriptores.forEach((callback) => callback());
}

// ---------- Acciones ----------
function agregar(libro, cantidad = 1) {
  guardar((actuales) => {
    if (actuales.some((item) => item.id === libro.id)) {
      return actuales.map((item) =>
        item.id === libro.id ? { ...item, cantidad: Math.min(item.cantidad + cantidad, libro.stock) } : item,
      );
    }
    const { id, titulo, autor, precio, portada, colorPortada, tipo, stock, numero } = libro;
    return [...actuales, { id, titulo, autor, precio, portada, colorPortada, tipo, stock, numero, cantidad }];
  });
}

function actualizarCantidad(id, cantidad) {
  guardar((actuales) =>
    cantidad <= 0
      ? actuales.filter((item) => item.id !== id)
      : actuales.map((item) => (item.id === id ? { ...item, cantidad: Math.min(cantidad, item.stock) } : item)),
  );
}

const quitar = (id) => guardar((actuales) => actuales.filter((item) => item.id !== id));
const vaciar = () => guardar(() => []);

export function CartProvider({ children }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo(() => {
    const items = raw === null ? [] : parsear(raw);
    return {
      items,
      cargado: raw !== null,
      agregar,
      actualizarCantidad,
      quitar,
      vaciar,
      totalUnidades: items.reduce((suma, item) => suma + item.cantidad, 0),
      totalPrecio: items.reduce((suma, item) => suma + item.cantidad * item.precio, 0),
      cantidadDe: (id) => items.find((item) => item.id === id)?.cantidad ?? 0,
    };
  }, [raw]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return context;
}
