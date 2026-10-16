import CartView from '@/components/libreria/CartView';

export const metadata = { title: 'Carrito' };

// La página es un Server Component con contenido estático; toda la interacción está en CartView (cliente).
export default function CarritoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">Compra</p>
      <h1 className="mt-2 mb-8 text-4xl font-semibold">Tu carrito</h1>
      <CartView />
    </div>
  );
}
