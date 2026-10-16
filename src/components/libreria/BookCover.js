// Server Component: portada real (next/image optimiza la imagen de Open Library)
// o portada generada con el color que define la API para las revistas sin imagen.
import Image from 'next/image';

function esColorClaro(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

export default function BookCover({ item, sizes = '(min-width: 1024px) 220px, 45vw', eager = false, className = '' }) {
  const base = `relative aspect-[2/3] overflow-hidden rounded-lg shadow-[0_10px_25px_-12px_rgba(29,36,34,0.45)] ${className}`;

  if (item.portada) {
    return (
      <div className={base} style={{ backgroundColor: item.colorPortada }}>
        <Image
          src={item.portada}
          alt={`Portada de ${item.titulo}`}
          fill
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          className="object-cover"
        />
      </div>
    );
  }

  const texto = esColorClaro(item.colorPortada) ? 'text-ink' : 'text-paper';
  return (
    <div
      className={`${base} flex flex-col justify-between p-[9%] ${texto}`}
      style={{ backgroundColor: item.colorPortada }}
      role="img"
      aria-label={`Portada de ${item.titulo}`}
    >
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] opacity-80">Revista</span>
      <span className="font-display text-[clamp(1rem,2.4vw,1.6rem)] font-semibold leading-tight">{item.titulo}</span>
      <span className="border-t border-current pt-2 text-[0.65rem] opacity-80">{item.numero}</span>
    </div>
  );
}
