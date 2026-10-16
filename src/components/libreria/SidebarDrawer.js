'use client';

// Client Component: en móvil el menú lateral es un panel desplegable que se abre y cierra con estado.
// Recibe como children otros componentes (categorías y filtros) sin necesidad de conocerlos.
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function SidebarDrawer({ children }) {
  const pathname = usePathname();
  // Se guarda en qué ruta se abrió el panel: al navegar a otra categoría queda cerrado solo
  const [abiertoEn, setAbiertoEn] = useState(null);
  const abierto = abiertoEn === pathname;
  const setAbierto = (valor) => setAbiertoEn(valor ? pathname : null);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="btn-ghost w-full justify-between lg:hidden"
        aria-expanded={abierto}
        aria-controls="panel-catalogo"
      >
        Categorías y filtros
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      </button>

      {abierto && (
        <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setAbierto(false)} aria-hidden="true" />
      )}

      <aside
        id="panel-catalogo"
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-paper p-5 shadow-2xl transition-transform duration-300 lg:sticky lg:top-24 lg:z-auto lg:max-h-[calc(100vh-7rem)] lg:w-auto lg:max-w-none lg:translate-x-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <p className="font-display text-lg font-semibold">Categorías y filtros</p>
          <button type="button" onClick={() => setAbierto(false)} className="btn-ghost px-3 py-1.5">
            Cerrar
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
