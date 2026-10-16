'use server';

import { redirect } from 'next/navigation';
import { postLogin } from '@/lib/api';
import { createSession, deleteSession } from '@/lib/session';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Solo se permite volver a rutas internas de la app
function destinoSeguro(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/libreria';
}

export async function login(_estadoPrevio, formData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!EMAIL.test(email)) return { error: 'Introduce un correo electrónico válido.', email };
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.', email };

  try {
    const { token, usuario } = await postLogin({ email, password });
    await createSession({ token, usuario });
  } catch {
    return { error: 'No se pudo conectar con el servidor. Inténtalo de nuevo.', email };
  }

  redirect(destinoSeguro(formData.get('next')));
}

export async function logout() {
  await deleteSession();
  redirect('/');
}
