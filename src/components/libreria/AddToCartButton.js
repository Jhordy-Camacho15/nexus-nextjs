'use client';

// Client Component: responde a un clic (onClick) y modifica el carrito del contexto.
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function AddToCartButton({ item, compacto = false }) {
  const { agregar, cantidadDe } = useCart();
  const [añadido, setAñadido] = useState(false);
  const enCarrito = cantidadDe(item.id);
  const agotado = item.stock === 0;
  const sinMasStock = enCarrito >= item.stock;

  function handleClick() {
    agregar(item);
    setAñadido(true);
    setTimeout(() => setAñadido(false), 1500);
  }

  let etiqueta = compacto ? 'Añadir' : 'Añadir al carrito';
  if (agotado) etiqueta = 'Agotado';
  else if (sinMasStock) etiqueta = 'Sin más stock';
  else if (añadido) etiqueta = '¡Añadido!';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={agotado || sinMasStock}
      className={`${compacto ? 'btn-ghost w-full px-3 py-2 text-xs' : 'btn-accent w-full sm:w-auto'}`}
      aria-live="polite"
    >
      {etiqueta}
      {!compacto && enCarrito > 0 && !agotado && <span className="opacity-80">· {enCarrito} en el carrito</span>}
    </button>
  );
}
