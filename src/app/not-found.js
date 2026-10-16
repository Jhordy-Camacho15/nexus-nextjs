import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-semibold text-accent">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Esta página no está en nuestras estanterías</h1>
      <p className="mt-3 text-ink-soft">Puede que el enlace sea antiguo o que el libro o espacio ya no exista.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
        <Link href="/libreria/catalogo" className="btn-ghost">
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
