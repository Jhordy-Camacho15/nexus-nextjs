// Server Component: los datos de contacto vienen de la API simulada y están cacheados,
// así que el pie de página se incluye en el HTML estático de todas las rutas.
import { getNexusInfo } from '@/lib/api';
import Logo from './Logo';

export default async function SiteFooter() {
  const info = await getNexusInfo();

  return (
    <footer className="mt-20 border-t border-line bg-paper-deep">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-ink-soft md:grid-cols-3">
        <div>
          <Logo className="text-ink" />
          <p className="mt-3 max-w-xs">{info.eslogan}</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Visítanos</p>
          <p className="mt-2">{info.direccion}</p>
          <p>{info.horario}</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Contacto</p>
          <p className="mt-2">{info.telefono}</p>
          <p>{info.email}</p>
        </div>
      </div>
    </footer>
  );
}
