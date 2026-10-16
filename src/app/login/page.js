import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Iniciar sesión' };

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center">
      <section>
        <p className="eyebrow">Acceso</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">Inicia sesión para entrar a Nexus</h1>
        <p className="mt-4 text-ink-soft">
          Con tu cuenta universitaria puedes comprar en la librería, consultar los libros que ya tienes y reservar
          espacios del coworking.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          <li>· Catálogo de libros y revistas con filtros</li>
          <li>· Historial de compras</li>
          <li>· Plano del coworking en tiempo real y reservas</li>
        </ul>
      </section>
      <section className="card p-6 sm:p-8">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-paper-deep" />}>
          <LoginForm />
        </Suspense>
      </section>
    </div>
  );
}
