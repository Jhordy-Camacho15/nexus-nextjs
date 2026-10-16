import 'server-only';
import { cookies } from 'next/headers';

// Sesión simulada guardada en cookies httpOnly. En actividades posteriores se sustituirá por Auth0.
export const SESSION_COOKIE = 'nexus_session';
const COMPRAS_COOKIE = 'nexus_compras';
const RESERVAS_COOKIE = 'nexus_reservas';
const MAX_REGISTROS = 15;

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decode(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    return fallback;
  }
}

async function readCookie(name, fallback) {
  return decode((await cookies()).get(name)?.value, fallback);
}

async function appendToCookie(name, registro) {
  const store = await cookies();
  const actuales = decode(store.get(name)?.value, []);
  store.set(name, encode([registro, ...actuales].slice(0, MAX_REGISTROS)), cookieOptions);
}

// ---------- Sesión ----------

export async function getSession() {
  return readCookie(SESSION_COOKIE, null);
}

export async function createSession({ token, usuario }) {
  (await cookies()).set(SESSION_COOKIE, encode({ token, usuario }), cookieOptions);
}

export async function deleteSession() {
  const store = await cookies();
  for (const name of [SESSION_COOKIE, COMPRAS_COOKIE, RESERVAS_COOKIE]) store.delete(name);
}

// ---------- Compras y reservas hechas en esta sesión ----------
// La API simulada no guarda datos, así que lo que el usuario compra o reserva se recuerda en cookies
// y se combina con el historial que devuelve la API.

export function getComprasSesion() {
  return readCookie(COMPRAS_COOKIE, []);
}

export function guardarCompra(compra) {
  return appendToCookie(COMPRAS_COOKIE, compra);
}

export function getReservasSesion() {
  return readCookie(RESERVAS_COOKIE, []);
}

export function guardarReserva(reserva) {
  return appendToCookie(RESERVAS_COOKIE, reserva);
}
