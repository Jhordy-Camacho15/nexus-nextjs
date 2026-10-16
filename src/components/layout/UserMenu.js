// Server Component: lee la cookie de sesión en el servidor. Se renderiza dentro de <Suspense>
// para que el resto de la cabecera forme parte del HTML estático.
import Link from 'next/link';
import { logout } from '@/actions/auth';
import { getSession } from '@/lib/session';

export default async function UserMenu() {
  const session = await getSession();

  if (!session) {
    return (
      <Link href="/login" className="btn-primary">
        Iniciar sesión
      </Link>
    );
  }

  const { nombre } = session.usuario;
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('');

  return (
    <div className="flex items-center gap-2">
      <span
        title={nombre}
        className="inline-flex size-10 items-center justify-center rounded-full bg-forest font-display text-sm font-semibold text-paper"
      >
        {iniciales}
      </span>
      <span className="hidden text-sm leading-tight lg:block">
        <span className="block text-ink-soft">Hola,</span>
        <span className="font-semibold">{nombre.split(' ')[0]}</span>
      </span>
      {/* Un formulario con Server Action no necesita JavaScript en el cliente */}
      <form action={logout}>
        <button type="submit" className="btn-ghost px-4">
          Salir
        </button>
      </form>
    </div>
  );
}
