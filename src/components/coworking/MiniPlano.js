// Server Component: plano estático en miniatura que resalta un espacio. Reutiliza el mismo módulo CSS
// que el plano interactivo, pero no necesita JavaScript en el cliente.
import Link from 'next/link';
import styles from './Plano.module.css';

export default function MiniPlano({ espacios, resaltado }) {
  return (
    <div className={`${styles.plano} ${styles.mini}`}>
      {espacios.map((espacio) => (
        <Link
          key={espacio.id}
          href={`/coworking/espacios/${espacio.id}`}
          title={espacio.nombre}
          aria-label={espacio.nombre}
          aria-current={espacio.id === resaltado ? 'page' : undefined}
          className={`${styles.celda} rounded ${espacio.id === resaltado ? 'bg-accent' : 'bg-paper-deep hover:bg-line'}`}
          style={{ '--x': espacio.posicion.x, '--y': espacio.posicion.y, '--w': espacio.posicion.w, '--h': espacio.posicion.h }}
        />
      ))}
    </div>
  );
}
