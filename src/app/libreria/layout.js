import SubNav from '@/components/layout/SubNav';

const enlaces = [
  { href: '/libreria', etiqueta: 'Más vendidos', exacto: true },
  { href: '/libreria/catalogo', etiqueta: 'Catálogo' },
  { href: '/libreria/mis-libros', etiqueta: 'Mis libros' },
  { href: '/libreria/carrito', etiqueta: 'Carrito' },
];

// Layout anidado: todas las rutas /libreria/* comparten esta barra y se mantiene montada al navegar entre ellas
export default function LibreriaLayout({ children }) {
  return (
    <>
      <SubNav titulo="Librería" enlaces={enlaces} />
      {children}
    </>
  );
}
