import SubNav from '@/components/layout/SubNav';

const enlaces = [
  { href: '/coworking', etiqueta: 'Plano y ocupación', exacto: true },
  { href: '/coworking/reservar', etiqueta: 'Reservar' },
  { href: '/coworking/mis-reservas', etiqueta: 'Mis reservas' },
];

export default function CoworkingLayout({ children }) {
  return (
    <>
      <SubNav titulo="Coworking" enlaces={enlaces} />
      {children}
    </>
  );
}
