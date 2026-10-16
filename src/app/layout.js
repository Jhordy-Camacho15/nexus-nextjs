import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'] });

export const metadata = {
  title: { default: 'Nexus · Librería universitaria y coworking', template: '%s · Nexus' },
  description: 'Compra libros y revistas académicas y reserva tu espacio de coworking en Nexus.',
};

// Layout raíz (Server Component). CartProvider es un Client Component que envuelve
// a los Server Components de cada página sin convertirlos en componentes de cliente.
export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
