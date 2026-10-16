import { Suspense } from 'react';
import CoworkingPlan from '@/components/coworking/CoworkingPlan';
import { getApiUrl, getEspacios, getOcupacion } from '@/lib/api';

export const metadata = { title: 'Coworking · Plano y ocupación' };

// Server Component que obtiene los datos iniciales: los espacios están cacheados (no cambian)
// y la ocupación se pide en cada petición (SSR). El plano interactivo es un Client Component
// que recibe esos datos como props y luego se actualiza solo desde el navegador.
async function PlanoEnVivo() {
  const [espacios, ocupacion] = await Promise.all([getEspacios(), getOcupacion()]);
  return <CoworkingPlan espacios={espacios} ocupacionInicial={ocupacion} apiUrl={getApiUrl()} />;
}

export default function CoworkingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">Coworking universitario</p>
      <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">¿Dónde hay sitio ahora?</h1>
      <p className="mt-3 mb-8 max-w-2xl text-ink-soft">
        Plano en tiempo real de la planta: qué espacios están ocupados, por quién, desde qué hora y cuándo se liberan.
      </p>
      <Suspense fallback={<div className="h-[28rem] animate-pulse rounded-2xl bg-paper-deep" aria-label="Cargando plano" />}>
        <PlanoEnVivo />
      </Suspense>
    </div>
  );
}
