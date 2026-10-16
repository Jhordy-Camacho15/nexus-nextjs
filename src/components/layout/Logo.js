export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-forest" />
        <path d="M9 23V9l14 14V9" fill="none" stroke="#f7f2e8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">Nexus</span>
    </span>
  );
}
