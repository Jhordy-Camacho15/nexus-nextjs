import Link from 'next/link';
import BookCover from '@/components/libreria/BookCover';
import { getCatalogo, getEspacios, getMasVendidos, getNexusInfo } from '@/lib/api';

// Landing general (Server Component). Todos los datos vienen de la API con 'use cache',
// así que la página se genera de forma estática en el build (SSG) y no envía JavaScript propio.
export default async function HomePage() {
  const [info, destacados, catalogo, espacios] = await Promise.all([
    getNexusInfo(),
    getMasVendidos(3),
    getCatalogo(),
    getEspacios(),
  ]);

  const rutas = { libreria: '/libreria', coworking: '/coworking' };
  const estadisticas = [
    [catalogo.filter((item) => item.tipo === 'libro').length, 'libros en catálogo'],
    [catalogo.filter((item) => item.tipo === 'revista').length, 'revistas académicas'],
    [espacios.length, 'espacios de coworking'],
    [espacios.reduce((suma, e) => suma + e.capacidad, 0), 'plazas para estudiar'],
  ];

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 md:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="eyebrow">Campus universitario</p>
          <h1 className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Libros, sitio para trabajar y buen café a un paso de tu aula.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">{info.eslogan}.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/libreria" className="btn-primary">
              Entrar a la librería
            </Link>
            <Link href="/coworking" className="btn-ghost">
              Ver el coworking
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-soft">Necesitas iniciar sesión con tu cuenta universitaria para comprar o reservar.</p>
        </div>

        <div className="relative mx-auto h-80 w-full max-w-sm sm:h-96" aria-hidden="true">
          {destacados.map((item, i) => (
            <div
              key={item.id}
              className={`absolute w-40 sm:w-48 ${
                ['left-0 top-10 -rotate-6', 'left-1/2 top-0 z-10 -translate-x-1/2', 'right-0 top-12 rotate-6'][i]
              }`}
            >
              <BookCover item={item} sizes="200px" eager />
            </div>
          ))}
          <div className="absolute inset-x-6 bottom-0 h-6 rounded-[50%] bg-ink/15 blur-md" />
        </div>
      </section>

      <section className="border-y border-line bg-card">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          {estadisticas.map(([valor, etiqueta]) => (
            <div key={etiqueta}>
              <dt className="sr-only">{etiqueta}</dt>
              <dd>
                <span className="block font-display text-4xl font-semibold">{valor}</span>
                <span className="text-sm text-ink-soft">{etiqueta}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <p className="eyebrow">Servicios</p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Todo lo que ofrece Nexus</h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {info.servicios.map((servicio, i) => {
            const contenido = (
              <>
                <span className="font-display text-sm text-ink-soft">0{i + 1}</span>
                <h3 className="mt-6 text-2xl font-semibold">{servicio.nombre}</h3>
                <p className="mt-2 text-sm text-ink-soft">{servicio.descripcion}</p>
                <span
                  className={`mt-auto pt-6 text-sm font-semibold ${servicio.disponibleEnApp ? 'text-forest' : 'text-ink-soft'}`}
                >
                  {servicio.disponibleEnApp ? 'Entrar →' : 'Próximamente en la app'}
                </span>
              </>
            );
            return (
              <li key={servicio.id}>
                {servicio.disponibleEnApp ? (
                  <Link
                    href={rutas[servicio.id]}
                    className="card flex h-full flex-col p-6 transition-colors hover:border-forest hover:bg-forest-soft"
                  >
                    {contenido}
                  </Link>
                ) : (
                  <div className="card flex h-full flex-col border-dashed bg-transparent p-6">{contenido}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
