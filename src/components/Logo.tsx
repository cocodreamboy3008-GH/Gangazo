export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 select-none">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#FF6B35" />
        <path d="M22 10c-1.5-1.8-3.7-3-6-3a9 9 0 1 0 9 9h-5" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <path d="M20 16h6l-3-4z" fill="#FFD60A" />
      </svg>
      <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        GANGA<span className="text-brand">ZO</span>
      </span>
    </span>
  );
}
