'use client';

// Los límites de error (error.js) tienen que ser Client Components: reciben la función reset()
// para volver a intentar el renderizado sin recargar la página.
export default function Error({ error, reset }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="eyebrow">Error</p>
      <h1 className="mt-2 text-4xl font-semibold">No hemos podido cargar esta página</h1>
      <p className="mt-4 text-ink-soft">
        Es posible que la API simulada no esté respondiendo. Comprueba la conexión e inténtalo de nuevo.
      </p>
      {error?.digest && <p className="mt-2 font-mono text-xs text-ink-soft">Referencia: {error.digest}</p>}
      <button type="button" onClick={() => reset()} className="btn-primary mt-8">
        Reintentar
      </button>
    </div>
  );
}
