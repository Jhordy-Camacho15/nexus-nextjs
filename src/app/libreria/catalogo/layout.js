import { Suspense } from 'react';
import CatalogFilters from '@/components/libreria/CatalogFilters';
import CategoryMenu from '@/components/libreria/CategoryMenu';
import SidebarDrawer from '@/components/libreria/SidebarDrawer';
import { getCatalogo, getCategorias } from '@/lib/api';
import { opcionesDeFiltro } from '@/lib/catalogo';

// Layout del catálogo (Server Component): obtiene categorías y opciones de filtro de la API
// y se las pasa a los Client Components del menú lateral. Se comparte entre /catalogo y /catalogo/[categoria].
export default async function CatalogoLayout({ children }) {
  const [categorias, catalogo] = await Promise.all([getCategorias(), getCatalogo()]);

  const conteo = { todos: catalogo.length };
  for (const item of catalogo) conteo[item.categoria] = (conteo[item.categoria] ?? 0) + 1;

  // CategoryMenu y CatalogFilters leen los searchParams del navegador (useSearchParams),
  // por eso van dentro de <Suspense> con un esqueleto mientras se hidratan.
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[250px_1fr]">
      <SidebarDrawer>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-paper-deep" />}>
          <CategoryMenu categorias={categorias} conteo={conteo} />
          <CatalogFilters opciones={opcionesDeFiltro(catalogo)} />
        </Suspense>
      </SidebarDrawer>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
