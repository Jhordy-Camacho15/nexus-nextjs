import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';

// Capa de acceso a la API simulada (Apidog). Solo se ejecuta en el servidor.
// Las lecturas que no dependen del usuario se cachean con 'use cache' y forman parte del HTML estático;
// las que deben estar al día (ocupación, historial del usuario) se piden en cada petición.

export function getApiUrl() {
  const url = process.env.NEXUS_API_URL;
  if (!url) throw new Error('Falta la variable de entorno NEXUS_API_URL (ver .env.example)');
  return url.replace(/\/$/, '');
}

async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const url = `${getApiUrl()}${path}`;
  const started = performance.now();
  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  console.log(`[API simulada] ${method} ${url} → ${res.status} (${Math.round(performance.now() - started)} ms)`);
  if (!res.ok) throw new Error(`La API simulada respondió ${res.status} en ${method} ${path}`);
  return res.json();
}

// ---------- Datos públicos y estables (cacheados) ----------

export async function getNexusInfo() {
  'use cache';
  cacheLife('days');
  return apiFetch('/nexus');
}

export async function getCategorias() {
  'use cache';
  cacheLife('days');
  return apiFetch('/categorias');
}

export async function getCatalogo() {
  'use cache';
  cacheLife('hours');
  cacheTag('catalogo');
  return apiFetch('/catalogo');
}

export async function getItem(id) {
  const catalogo = await getCatalogo();
  return catalogo.find((item) => String(item.id) === String(id)) ?? null;
}

export async function getMasVendidos(limite = 10) {
  const catalogo = await getCatalogo();
  return [...catalogo].sort((a, b) => b.ventasUltimasSemanas - a.ventasUltimasSemanas).slice(0, limite);
}

export async function getEspacios() {
  'use cache';
  cacheLife('days');
  return apiFetch('/coworking/espacios');
}

export async function getEspacio(id) {
  const espacios = await getEspacios();
  return espacios.find((espacio) => espacio.id === id) ?? null;
}

// ---------- Datos que cambian en cada petición (sin caché) ----------

export function getOcupacion() {
  return apiFetch('/coworking/ocupacion');
}

export function getHistorialCompras(token) {
  return apiFetch('/usuarios/me/compras', { token });
}

export function getHistorialReservas(token) {
  return apiFetch('/usuarios/me/reservas', { token });
}

// ---------- Escrituras (se llaman desde Server Actions) ----------

export function postLogin(credenciales) {
  return apiFetch('/auth/login', { method: 'POST', body: credenciales });
}

export function postCompra(pedido, token) {
  return apiFetch('/compras', { method: 'POST', body: pedido, token });
}

export function postReserva(reserva, token) {
  return apiFetch('/coworking/reservas', { method: 'POST', body: reserva, token });
}
