'use client';

// Client Component: formulario con estado (useActionState) para mostrar errores y el estado de envío,
// y useSearchParams para saber a qué página volver después de iniciar sesión.
import { useSearchParams } from 'next/navigation';
import { useActionState, useState } from 'react';
import { login } from '@/actions/auth';

const DEMO = { email: 'jhordy.camacho@nexus.edu', password: 'nexus2026' };

export default function LoginForm() {
  const [estado, accion, pendiente] = useActionState(login, null);
  const [campos, setCampos] = useState({ email: estado?.email ?? '', password: '' });
  const next = useSearchParams().get('next') ?? '/libreria';

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">
          Correo universitario
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={campos.email}
          onChange={(event) => setCampos({ ...campos, email: event.target.value })}
          className="field py-3"
          placeholder="nombre@nexus.edu"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={campos.password}
          onChange={(event) => setCampos({ ...campos, password: event.target.value })}
          className="field py-3"
        />
      </div>

      {estado?.error && (
        <p role="alert" className="rounded-xl bg-busy-soft px-3 py-2 text-sm text-busy">
          {estado.error}
        </p>
      )}

      <button type="submit" disabled={pendiente} className="btn-primary w-full py-3">
        {pendiente ? 'Entrando…' : 'Iniciar sesión'}
      </button>

      <div className="rounded-xl border border-dashed border-line p-4 text-sm">
        <p className="font-semibold">Cuenta de prueba</p>
        <p className="mt-1 text-ink-soft">
          {DEMO.email} · {DEMO.password}
        </p>
        <button type="button" onClick={() => setCampos(DEMO)} className="mt-2 font-semibold text-forest underline">
          Rellenar con la cuenta de prueba
        </button>
      </div>
    </form>
  );
}
